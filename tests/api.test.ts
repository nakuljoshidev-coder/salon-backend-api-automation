import request from 'supertest';

const baseURL = 'http://localhost:3000';

const salonId = '6aa641975d71ff9bf545c9a7';
const stylistId = '6aa641975d71ff9bf545c9a5';
const serviceId = '6aa641975d71ff9bf545c9a8';

let token: string;
let bookingId: string;

const testEmail = `testuser${Date.now()}@gmail.com`;
const testPassword = 'Test@123';

describe('Salon Backend API Automation', () => {
  // 1. Backend health check
  it('should verify that the backend is running', async () => {
    const response = await request(baseURL).get('/');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  // 2. Register - positive
  it('should register a new user successfully', async () => {
    const response = await request(baseURL)
      .post('/api/register')
      .send({
        name: 'Automation Test User',
        email: testEmail,
        password: testPassword,
      });

    expect([200, 201]).toContain(response.status);
    expect(response.body).toHaveProperty('message');
  });

  // 3. Register - missing fields
  it('should reject registration with missing required fields', async () => {
    const response = await request(baseURL)
      .post('/api/register')
      .send({
        email: `invalid${Date.now()}@gmail.com`,
      });

    expect([400, 422, 500]).toContain(response.status);
  });

  // 4. Login - positive
  it('should login with valid credentials', async () => {
    const response = await request(baseURL)
      .post('/api/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    token = response.body.token;
  });

  // 5. Login - wrong password
  it('should reject login with invalid credentials', async () => {
    const response = await request(baseURL)
      .post('/api/login')
      .send({
        email: testEmail,
        password: 'WrongPassword123',
      });

    expect([400, 401]).toContain(response.status);
  });

  // 6. Login - missing password
  it('should reject login when password is missing', async () => {
    const response = await request(baseURL)
      .post('/api/login')
      .send({
        email: testEmail,
      });

    expect([400, 401, 422, 500]).toContain(response.status);
  });

  // 7. Available slots - positive
  it('should fetch available slots for a salon', async () => {
    const response = await request(baseURL).get(
      `/api/salons/${salonId}/available-slots?date=2026-09-17&serviceId=${serviceId}`
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('date');
    expect(response.body).toHaveProperty('availableSlots');
    expect(Array.isArray(response.body.availableSlots)).toBe(true);
  });

  // 8. Available slots - invalid salon ID
  it('should handle an invalid salon ID', async () => {
    const response = await request(baseURL).get(
      `/api/salons/invalid-salon-id/available-slots?date=2026-09-18&serviceId=${serviceId}`
    );

    expect([400, 404, 500]).toContain(response.status);
  });

  // 9. Booking - no authentication
  it('should reject booking without authentication', async () => {
    const response = await request(baseURL)
      .post('/api/bookings')
      .send({
        salonId,
        stylistId,
        serviceId,
        slotTime: '09:00',
        date: '2026-09-17',
      });

    expect([401, 403]).toContain(response.status);
  });

  // 10. Booking - invalid token
  it('should reject booking with an invalid token', async () => {
    const response = await request(baseURL)
      .post('/api/bookings')
      .set('Authorization', 'Bearer invalid.token.value')
      .send({
        salonId,
        stylistId,
        serviceId,
        slotTime: '11:00',
        date: '2026-09-18',
      });

    expect([401, 403]).toContain(response.status);
  });

  // 11. Booking - missing fields
  it('should reject booking when required fields are missing', async () => {
    const response = await request(baseURL)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        salonId,
        date: '2026-09-18',
      });

    expect([400, 404, 422, 500]).toContain(response.status);
  });

  // 12. Booking - positive
  it('should create a booking with valid authentication', async () => {
    const response = await request(baseURL)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        salonId,
        stylistId,
        serviceId,
        slotTime: '09:00',
        date: '2026-09-17',
      });

    expect([200, 201]).toContain(response.status);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('booking');

    bookingId = response.body.booking._id;

    expect(bookingId).toBeDefined();
  });

  // 13. Cancel booking - positive
  it('should cancel the created booking successfully', async () => {
    const response = await request(baseURL)
      .post(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });

  // 14. Cancel booking - non-existing booking
  it('should reject cancellation of a non-existing booking', async () => {
    const response = await request(baseURL)
      .post('/api/bookings/000000000000000000000000/cancel')
      .set('Authorization', `Bearer ${token}`);

    expect([400, 404]).toContain(response.status);
  });

  // 15. Cancel booking - invalid token
  it('should reject cancellation with an invalid token', async () => {
    const response = await request(baseURL)
      .post('/api/bookings/000000000000000000000000/cancel')
      .set('Authorization', 'Bearer invalid.token.value');

    expect([401, 403]).toContain(response.status);
  });
});