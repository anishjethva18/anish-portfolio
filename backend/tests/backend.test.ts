import { db } from '../db/database';
import { authService } from '../services/authService';

async function runTests() {
  console.log('=== Starting Windows 11 Backend & Database Test Suite ===');

  let passed = 0;
  let failed = 0;

  // Test 1: Database initialization
  try {
    const users = db.getUsers();
    if (users.length > 0) {
      console.log('✔ Test 1 Passed: Database initialized with default admin user');
      passed++;
    } else {
      throw new Error('No users found in database');
    }
  } catch (err: any) {
    console.error('✘ Test 1 Failed:', err.message);
    failed++;
  }

  // Test 2: User Authentication
  try {
    const loginResult = await authService.login('anish.jethva2006@gmail.com', 'Admin@2026');
    if (loginResult && loginResult.tokens.accessToken) {
      console.log('✔ Test 2 Passed: Admin password verified with bcrypt & JWT issued');
      passed++;
    } else {
      throw new Error('Authentication failed for default credentials');
    }
  } catch (err: any) {
    console.error('✘ Test 2 Failed:', err.message);
    failed++;
  }

  // Test 3: JWT Verification
  try {
    const loginResult = await authService.login('anish.jethva2006@gmail.com', 'Admin@2026');
    const payload = authService.verifyToken(loginResult.tokens.accessToken);
    if (payload && payload.userId === 'usr_admin_anish') {
      console.log('✔ Test 3 Passed: JWT verified and claims validated');
      passed++;
    } else {
      throw new Error('JWT token payload mismatch');
    }
  } catch (err: any) {
    console.error('✘ Test 3 Failed:', err.message);
    failed++;
  }

  // Test 4: Task creation & Retrieval
  try {
    const task = db.createTask({
      userId: 'usr_admin_anish',
      title: 'Automated CI/CD Test Task',
      status: 'pending',
      priority: 'high',
      dueDate: new Date().toISOString(),
    });

    const tasks = db.getTasksByUserId('usr_admin_anish');
    const exists = tasks.some((t) => t.id === task.id);
    if (exists) {
      console.log('✔ Test 4 Passed: Task created and persisted in VFS database');
      passed++;
    } else {
      throw new Error('Created task not found');
    }
  } catch (err: any) {
    console.error('✘ Test 4 Failed:', err.message);
    failed++;
  }

  // Test 5: Analytics Logging
  try {
    db.logEvent({
      eventName: 'TEST_EVENT',
      ipAddress: '127.0.0.1',
      metadata: { status: 200, durationMs: 2 },
    });
    const summary = db.getAnalyticsSummary();
    if (summary.totalRequests > 0) {
      console.log('✔ Test 5 Passed: Telemetry & security audit logging validated');
      passed++;
    } else {
      throw new Error('Analytics log failed');
    }
  } catch (err: any) {
    console.error('✘ Test 5 Failed:', err.message);
    failed++;
  }

  console.log(`\nTest Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
