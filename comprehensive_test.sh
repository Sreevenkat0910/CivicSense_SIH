#!/bin/bash

# Comprehensive CivicSense API Testing Script
# This script tests all CRUD operations and functionalities

BASE_URL="http://localhost:4000"
API_BASE="$BASE_URL/api"

echo "🔍 Comprehensive CivicSense API Testing"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    local auth_token=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing $description... "
    
    local headers="Content-Type: application/json"
    if [ ! -z "$auth_token" ]; then
        headers="$headers
Authorization: Bearer $auth_token"
    fi
    
    if [ "$method" = "GET" ]; then
        if [ ! -z "$auth_token" ]; then
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json \
                -H "Authorization: Bearer $auth_token" \
                "$API_BASE$endpoint")
        else
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$API_BASE$endpoint")
        fi
    elif [ "$method" = "POST" ]; then
        if [ ! -z "$auth_token" ]; then
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth_token" \
                -d "$data" \
                "$API_BASE$endpoint")
        else
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X POST \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$API_BASE$endpoint")
        fi
    elif [ "$method" = "PATCH" ]; then
        if [ ! -z "$auth_token" ]; then
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X PATCH \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth_token" \
                -d "$data" \
                "$API_BASE$endpoint")
        else
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X PATCH \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$API_BASE$endpoint")
        fi
    elif [ "$method" = "DELETE" ]; then
        if [ ! -z "$auth_token" ]; then
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X DELETE \
                -H "Authorization: Bearer $auth_token" \
                "$API_BASE$endpoint")
        else
            response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X DELETE \
                "$API_BASE$endpoint")
        fi
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        if [ -s /tmp/response.json ]; then
            local response_content=$(cat /tmp/response.json | jq -r '.message // .success // .error // "OK"' 2>/dev/null || echo "Valid JSON")
            if [ ${#response_content} -gt 50 ]; then
                response_content="${response_content:0:50}..."
            fi
            echo "   Response: $response_content"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        if [ -s /tmp/response.json ]; then
            echo "   Error: $(cat /tmp/response.json)"
        fi
    fi
    echo
}

# Test 1: Basic Health Check
echo "1. Basic Health Check"
echo "--------------------"
test_endpoint "GET" "/health" "" "200" "Health endpoint"

# Test 2: API Information
echo "2. API Information"
echo "-----------------"
test_endpoint "GET" "" "" "200" "Root API endpoint"

# Test 3: User Types (Public endpoint)
echo "3. User Types"
echo "------------"
test_endpoint "GET" "/usertypes" "" "200" "Get user types"

# Test 4: Authentication Tests
echo "4. Authentication Tests"
echo "----------------------"

# Test registration
echo "Testing user registration..."
test_endpoint "POST" "/auth/register" '{
    "fullName": "Test User",
    "email": "testuser@example.com",
    "password": "test123",
    "mobile": "+91 9876543210",
    "usertype_id": 4
}' "201" "User registration"

# Test login with demo credentials
echo "Testing login with demo credentials..."
login_response=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@civicsense.com",
        "password": "admin123"
    }')

echo "Login response: $login_response"

# Extract token if login successful
auth_token=$(echo "$login_response" | jq -r '.token // empty' 2>/dev/null)

if [ ! -z "$auth_token" ]; then
    echo -e "${GREEN}✓ Login successful, token obtained${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ Login failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 5: Reports CRUD Operations
echo "5. Reports CRUD Operations"
echo "------------------------"

# Test get reports (should work without auth for public reports)
test_endpoint "GET" "/reports" "" "200" "Get all reports"

# Test create report
test_endpoint "POST" "/reports" '{
    "title": "Test Report",
    "category": "Test",
    "description": "This is a test report",
    "department": "Test Department",
    "reporter_email": "test@example.com"
}' "201" "Create new report"

# Test 6: Users CRUD Operations (Requires Auth)
echo "6. Users CRUD Operations"
echo "----------------------"

if [ ! -z "$auth_token" ]; then
    test_endpoint "GET" "/users" "" "200" "Get users (with auth)" "$auth_token"
    test_endpoint "GET" "/users/admin-001" "" "200" "Get single user (with auth)" "$auth_token"
else
    echo "Skipping user tests - no auth token available"
fi

# Test 7: Notifications CRUD Operations (Requires Auth)
echo "7. Notifications CRUD Operations"
echo "-------------------------------"

if [ ! -z "$auth_token" ]; then
    test_endpoint "GET" "/notifications" "" "200" "Get notifications (with auth)" "$auth_token"
else
    echo "Skipping notification tests - no auth token available"
fi

# Test 8: Schedules CRUD Operations (Requires Auth)
echo "8. Schedules CRUD Operations"
echo "---------------------------"

if [ ! -z "$auth_token" ]; then
    test_endpoint "GET" "/schedules" "" "200" "Get schedules (with auth)" "$auth_token"
    
    # Test create schedule
    test_endpoint "POST" "/schedules" '{
        "title": "Test Schedule",
        "description": "Test schedule item",
        "start_time": "2024-01-20T10:00:00Z",
        "end_time": "2024-01-20T11:00:00Z",
        "location": "Test Location"
    }' "201" "Create schedule (with auth)" "$auth_token"
else
    echo "Skipping schedule tests - no auth token available"
fi

# Test 9: Analytics Operations (Requires Auth)
echo "9. Analytics Operations"
echo "---------------------"

if [ ! -z "$auth_token" ]; then
    test_endpoint "GET" "/analytics/overview" "" "200" "Get analytics overview (with auth)" "$auth_token"
    test_endpoint "GET" "/analytics/reports/summary" "" "200" "Get reports summary (with auth)" "$auth_token"
else
    echo "Skipping analytics tests - no auth token available"
fi

# Test 10: File Upload Test
echo "10. File Upload Test"
echo "------------------"
echo -n "Testing file upload endpoint... "
# Create a test image file
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" | base64 -d > /tmp/test.png

upload_response=$(curl -s -w "%{http_code}" -o /tmp/upload_response.json \
    -X POST \
    -F "photos=@/tmp/test.png" \
    "$API_BASE/reports/upload-photos")

TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [ "$upload_response" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo "   Upload successful"
else
    echo -e "${RED}✗ FAIL${NC} (Status: $upload_response)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test 11: Error Handling Tests
echo "11. Error Handling Tests"
echo "-----------------------"

# Test invalid login
test_endpoint "POST" "/auth/login" '{"email":"invalid@test.com","password":"wrong"}' "401" "Invalid login"

# Test missing required fields
test_endpoint "POST" "/auth/register" '{"email":"test@test.com"}' "400" "Missing required fields"

# Test unauthorized access
test_endpoint "GET" "/users" "" "401" "Unauthorized access to users"

# Test 12: Edge Cases
echo "12. Edge Cases"
echo "-------------"

# Test with empty data
test_endpoint "POST" "/auth/login" '{}' "400" "Empty login data"

# Test with malformed JSON
echo -n "Testing malformed JSON... "
malformed_response=$(curl -s -w "%{http_code}" -o /tmp/malformed_response.json \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"invalid": json}' \
    "$API_BASE/auth/login")

TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [ "$malformed_response" = "400" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ FAIL${NC} (Status: $malformed_response)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Cleanup
rm -f /tmp/test.png /tmp/response.json /tmp/upload_response.json /tmp/malformed_response.json

# Final Results
echo
echo "======================================="
echo "🎯 Testing Complete!"
echo
echo "📊 Test Results:"
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! The API is working perfectly.${NC}"
elif [ $PASSED_TESTS -gt $FAILED_TESTS ]; then
    echo -e "${YELLOW}⚠️  Most tests passed. Some issues need attention.${NC}"
else
    echo -e "${RED}❌ Multiple test failures. The API needs significant fixes.${NC}"
fi

echo
echo "🔧 Next Steps:"
echo "1. Fix any failed tests"
echo "2. Set up Supabase database for full functionality"
echo "3. Test with real data"
echo "4. Deploy to production"
echo
echo "📝 Detailed logs available in server console"
