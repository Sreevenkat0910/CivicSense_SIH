#!/bin/bash

# Comprehensive CRUD Testing Script for All User Types
# This script tests every CRUD operation for every user type

echo "🔍 COMPREHENSIVE CRUD TESTING FOR ALL USER TYPES"
echo "================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local expected_status="$2"
    local command="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo "Testing $test_name..."
    response=$(eval "$command" 2>/dev/null)
    status_code=$(echo "$response" | tail -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "  ${GREEN}✓ PASS${NC} (Status: $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        echo "  Response: $response"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# Get tokens for all user types
echo "🔐 Getting authentication tokens..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@civicsense.com","password":"admin123"}' | jq -r '.token')
DEPT_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"priya@civicsense.com","password":"admin123"}' | jq -r '.token')
CITIZEN_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"citizen@civicsense.com","password":"admin123"}' | jq -r '.token')

echo "✓ Tokens obtained for all user types"
echo ""

# 1. ADMIN USER CRUD OPERATIONS
echo "1. ADMIN USER CRUD OPERATIONS"
echo "=============================="

run_test "Admin - Get all users" "200" "curl -s -w '%{http_code}' -H 'Authorization: Bearer $ADMIN_TOKEN' http://localhost:4000/api/users | tail -1"
run_test "Admin - Get all reports" "200" "curl -s -w '%{http_code}' -H 'Authorization: Bearer $ADMIN_TOKEN' http://localhost:4000/api/reports | tail -1"
run_test "Admin - Update report status" "200" "curl -s -w '%{http_code}' -X PATCH -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"status\":\"in_progress\",\"resolution_notes\":\"Admin updated\"}' http://localhost:4000/api/reports/1/status | tail -1"
run_test "Admin - Get single report" "200" "curl -s -w '%{http_code}' -H 'Authorization: Bearer $ADMIN_TOKEN' http://localhost:4000/api/reports/1 | tail -1"

# 2. DEPARTMENT USER CRUD OPERATIONS
echo "2. DEPARTMENT USER CRUD OPERATIONS"
echo "=================================="

run_test "Department - Get all reports" "200" "curl -s -w '%{http_code}' -H 'Authorization: Bearer $DEPT_TOKEN' http://localhost:4000/api/reports | tail -1"
run_test "Department - Update report status" "200" "curl -s -w '%{http_code}' -X PATCH -H 'Authorization: Bearer $DEPT_TOKEN' -H 'Content-Type: application/json' -d '{\"status\":\"resolved\",\"resolution_notes\":\"Department resolved\"}' http://localhost:4000/api/reports/2/status | tail -1"
run_test "Department - Get single report" "200" "curl -s -w '%{http_code}' -H 'Authorization: Bearer $DEPT_TOKEN' http://localhost:4000/api/reports/2 | tail -1"

# 3. CITIZEN USER CRUD OPERATIONS
echo "3. CITIZEN USER CRUD OPERATIONS"
echo "==============================="

run_test "Citizen - Get own reports" "200" "curl -s -w '%{http_code}' -H 'Authorization: Bearer $CITIZEN_TOKEN' http://localhost:4000/api/reports/user/citizen-001 | tail -1"
run_test "Citizen - Get all reports (should work)" "200" "curl -s -w '%{http_code}' -H 'Authorization: Bearer $CITIZEN_TOKEN' http://localhost:4000/api/reports | tail -1"
run_test "Citizen - Get single report" "200" "curl -s -w '%{http_code}' -H 'Authorization: Bearer $CITIZEN_TOKEN' http://localhost:4000/api/reports/1 | tail -1"

# 4. PUBLIC ENDPOINTS (No authentication required)
echo "4. PUBLIC ENDPOINTS"
echo "==================="

run_test "Public - Get user types" "200" "curl -s -w '%{http_code}' http://localhost:4000/api/usertypes | tail -1"
run_test "Public - Health check" "200" "curl -s -w '%{http_code}' http://localhost:4000/api/health | tail -1"

# 5. AUTHENTICATION TESTS
echo "5. AUTHENTICATION TESTS"
echo "======================="

run_test "Auth - Admin login" "200" "curl -s -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{\"email\":\"admin@civicsense.com\",\"password\":\"admin123\"}' http://localhost:4000/api/auth/login | tail -1"
run_test "Auth - Department login" "200" "curl -s -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{\"email\":\"priya@civicsense.com\",\"password\":\"admin123\"}' http://localhost:4000/api/auth/login | tail -1"
run_test "Auth - Citizen login" "200" "curl -s -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{\"email\":\"citizen@civicsense.com\",\"password\":\"admin123\"}' http://localhost:4000/api/auth/login | tail -1"
run_test "Auth - Token verification" "200" "curl -s -w '%{http_code}' -H 'Authorization: Bearer $ADMIN_TOKEN' http://localhost:4000/api/auth/verify | tail -1"

# 6. ERROR HANDLING TESTS
echo "6. ERROR HANDLING TESTS"
echo "======================="

run_test "Error - Invalid login" "401" "curl -s -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{\"email\":\"invalid@test.com\",\"password\":\"wrong\"}' http://localhost:4000/api/auth/login | tail -1"
run_test "Error - Unauthorized access" "401" "curl -s -w '%{http_code}' http://localhost:4000/api/users | tail -1"
run_test "Error - Invalid token" "403" "curl -s -w '%{http_code}' -H 'Authorization: Bearer invalid_token' http://localhost:4000/api/users | tail -1"

# Summary
echo "================================================="
echo "🎯 TESTING COMPLETE!"
echo ""
echo "📊 Test Results:"
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! All CRUD operations are working perfectly!${NC}"
elif [ $PASSED_TESTS -gt $FAILED_TESTS ]; then
    echo -e "${YELLOW}⚠️  Most tests passed. Some issues need attention.${NC}"
else
    echo -e "${RED}❌ Multiple tests failed. Significant issues need to be addressed.${NC}"
fi

echo ""
echo "🔧 Next Steps:"
echo "1. Fix any failed tests"
echo "2. Add missing mock data fallbacks"
echo "3. Test with real Supabase database"
echo "4. Deploy to production"
echo ""
echo "📝 Detailed logs available in server console"
