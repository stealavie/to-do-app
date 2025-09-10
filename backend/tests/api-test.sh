#!/bin/bash

# API Test Script for Collaborative Learning Platform Backend
# This script tests all the implemented endpoints

BASE_URL="http://localhost:3000"

echo "🧪 Testing Collaborative Learning Platform Backend API"
echo "================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test health endpoint
echo -e "\n${BLUE}1. Testing Health Check${NC}"
echo "GET $BASE_URL/health"
curl -s -X GET "$BASE_URL/health" | jq '.'

# Test user registration
echo -e "\n${BLUE}2. Testing User Registration${NC}"
echo "POST $BASE_URL/api/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "username": "testuser",
    "password": "password123"
  }')
echo "$REGISTER_RESPONSE" | jq '.'

# Extract token from registration response
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')

# Test user login
echo -e "\n${BLUE}3. Testing User Login${NC}"
echo "POST $BASE_URL/api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }')
echo "$LOGIN_RESPONSE" | jq '.'

# Test creating a learning group
echo -e "\n${BLUE}4. Testing Create Learning Group${NC}"
echo "POST $BASE_URL/api/groups"
GROUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/groups" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Study Group",
    "description": "A group for testing the API",
    "isPublic": true
  }')
echo "$GROUP_RESPONSE" | jq '.'

# Extract group ID and invite code
GROUP_ID=$(echo "$GROUP_RESPONSE" | jq -r '.group.id')
INVITE_CODE=$(echo "$GROUP_RESPONSE" | jq -r '.group.inviteCode')

# Test getting group details
echo -e "\n${BLUE}5. Testing Get Group Details${NC}"
echo "GET $BASE_URL/api/groups/$GROUP_ID"
curl -s -X GET "$BASE_URL/api/groups/$GROUP_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Test creating a project
echo -e "\n${BLUE}6. Testing Create Project${NC}"
echo "POST $BASE_URL/api/groups/$GROUP_ID/projects"
PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/groups/$GROUP_ID/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Project",
    "description": "A test project for API testing",
    "dueDate": "2025-09-20T10:00:00Z"
  }')
echo "$PROJECT_RESPONSE" | jq '.'

# Test getting all projects
echo -e "\n${BLUE}7. Testing Get All Projects${NC}"
echo "GET $BASE_URL/api/groups/$GROUP_ID/projects"
curl -s -X GET "$BASE_URL/api/groups/$GROUP_ID/projects" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Test joining group with invite code (register another user first)
echo -e "\n${BLUE}8. Testing Join Group (with new user)${NC}"
echo "Registering second user..."
REGISTER_RESPONSE2=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser2@example.com",
    "username": "testuser2",
    "password": "password123"
  }')

TOKEN2=$(echo "$REGISTER_RESPONSE2" | jq -r '.token')

echo "POST $BASE_URL/api/groups/join"
curl -s -X POST "$BASE_URL/api/groups/join" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d "{
    \"inviteCode\": \"$INVITE_CODE\"
  }" | jq '.'

# Test inviting user to group
echo -e "\n${BLUE}9. Testing Invite User to Group${NC}"
echo "Registering third user..."
REGISTER_RESPONSE3=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser3@example.com",
    "username": "testuser3",
    "password": "password123"
  }')

echo "POST $BASE_URL/api/groups/$GROUP_ID/invite"
curl -s -X POST "$BASE_URL/api/groups/$GROUP_ID/invite" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "testuser3"
  }' | jq '.'

# Test error cases
echo -e "\n${BLUE}10. Testing Error Cases${NC}"

echo -e "\n${BLUE}a) Invalid login credentials${NC}"
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@example.com",
    "password": "wrongpassword"
  }' | jq '.'

echo -e "\n${BLUE}b) Unauthorized access (no token)${NC}"
curl -s -X GET "$BASE_URL/api/groups/$GROUP_ID" | jq '.'

echo -e "\n${BLUE}c) Invalid invite code${NC}"
curl -s -X POST "$BASE_URL/api/groups/join" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{
    "inviteCode": "invalid-code"
  }' | jq '.'

echo -e "\n${GREEN}✅ API Testing Complete!${NC}"
echo "================================================="
