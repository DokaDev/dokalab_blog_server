# Authentication & Authorization Implementation Plan

## Overview
NestJS GraphQL API에 인증/인가 시스템 구현을 위한 커스텀 데코레이터와 가드 구조

## Current Status
- ✅ 기본 Context Middleware 구현됨
- ✅ RequestContext 및 CurrentUserDto 구조 완성
- ✅ 테스트용 간단한 인증 로직 (JWT 이전 단계)

## Implementation Structure

### 1. Custom Decorators

#### @LoginRequired()
- **파일**: `src/auth/decorators/login-required.decorator.ts`
- **목적**: 로그인된 사용자만 접근 가능
- **메타데이터 키**: `loginRequired`

#### @AdminRequired()
- **파일**: `src/auth/decorators/admin-required.decorator.ts`
- **목적**: 관리자 권한 사용자만 접근 가능
- **메타데이터 키**: `adminRequired`
- **특징**: LoginRequired를 자동으로 포함

### 2. Guards

#### LoginGuard
- **파일**: `src/auth/guards/login.guard.ts`
- **검증**: `currentUser` 존재 여부
- **에러**: `UnauthorizedException` - "Login required"

#### AdminGuard
- **파일**: `src/auth/guards/admin.guard.ts`
- **검증**:
  1. `currentUser` 존재 여부 (로그인 체크)
  2. `currentUser.isAdmin` true 여부
- **에러**:
  - `UnauthorizedException` - "Login required" (로그인 안됨)
  - `ForbiddenException` - "Admin access required" (권한 없음)

### 3. Guard Application Order

```typescript
// app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: LoginGuard,    // 1순위: 로그인 체크
  },
  {
    provide: APP_GUARD,
    useClass: AdminGuard,    // 2순위: 어드민 체크
  },
],
```

### 4. Usage Examples

```typescript
// 로그인만 필요한 경우
@LoginRequired()
@Query(() => UserProfileDto)
async getMyProfile(@Context() context: RequestContext) {
  return context.currentUser;
}

// 관리자 권한 필요한 경우 (로그인 자동 포함)
@AdminRequired()
@Query(() => [BoardGroupDto])
async findAllBoardGroups(@Context() context: RequestContext) {
  return await this.boardGroupService.findAll();
}

// 권한 체크 없는 공개 API
@Query(() => [PublicDataDto])
async getPublicData() {
  return await this.service.getPublicData();
}
```

## Current Test Setup

### Context Middleware
- **위치**: `src/auth/context.middleware.ts`
- **테스트 사용자**:
  ```typescript
  user = {
    id: 1,
    nickname: 'doka',
    isAdmin: true,  // 테스트용 관리자 권한
    userInput: auth,
  };
  ```

### Test Endpoint
- **위치**: `src/boardgroup/board-group.resolver.ts`
- **메서드**: `findAllBoardGroups`
- **데코레이터**: `@AdminRequired()` 적용됨

## Next Steps

1. **테스트 실행**
   - Authorization header 있을 때 (admin)
   - Authorization header 없을 때 (unauthorized)
   - Authorization header 있지만 isAdmin: false일 때

2. **JWT 구현 준비**
   - JWT 파싱 로직을 context.middleware.ts에 추가
   - 실제 사용자 데이터베이스 연동
   - 토큰 만료 처리

3. **추가 데코레이터 고려**
   - `@Roles(['admin', 'moderator'])` - 다중 역할 지원
   - `@OptionalAuth()` - 선택적 인증 (로그인시 추가 정보)

## File Structure
```
src/auth/
├── decorators/
│   ├── admin-required.decorator.ts
│   └── login-required.decorator.ts
├── guards/
│   ├── admin.guard.ts
│   └── login.guard.ts
├── dto/
│   └── current-user.dto.ts
├── context.middleware.ts
└── request-context.ts
```

## Error Handling
- **UnauthorizedException**: 로그인이 필요한 경우
- **ForbiddenException**: 권한이 부족한 경우
- GraphQL 에러 응답으로 자동 변환됨