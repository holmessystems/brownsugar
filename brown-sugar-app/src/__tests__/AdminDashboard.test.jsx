import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboard from '../components/AdminDashboard';

const ADMIN_PASSWORD = 'brownsugar2025';

// Mock settings returned by the API
const mockSettings = {
  soldOut: false,
  orderCount: 5,
  orderLimit: 20,
  pickupDay: '2025-05-01',
  events: [],
  pickupOptions: [],
  products: [
    { id: 1, name: '4-Pack', price: 30, boxSize: 4, description: 'Four rolls', image: '/images/variety-image.jpg' },
    { id: 2, name: '6-Pack', price: 42, boxSize: 6, description: 'Six rolls', image: '/images/variety-image.jpg' },
  ],
  flavors: [
    { id: 'classic', name: 'Classic', image: '/images/classic.jpeg' },
    { id: 'matcha', name: 'Matcha', image: '/images/matcha.jpeg' },
  ],
};

async function loginAndRender() {
  const user = userEvent.setup();

  // First call: login POST, second: GET settings, third: GET location
  global.fetch = vi.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: ADMIN_PASSWORD }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSettings),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'Test Location', status: 'ACTIVE', locationId: 'L1', address: {} }),
    });

  render(<AdminDashboard />);

  // Login
  const passwordInput = screen.getByPlaceholderText(/enter admin password/i);
  await user.type(passwordInput, ADMIN_PASSWORD);
  await user.click(screen.getByText(/sign in/i));

  // Wait for settings to load
  await act(async () => {});

  return user;
}

describe('AdminDashboard – Products section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('displays all products after login', async () => {
    await loginAndRender();

    expect(screen.getByText('Products (Box Sizes)')).toBeInTheDocument();
    expect(screen.getByText('4-Pack')).toBeInTheDocument();
    expect(screen.getByText('6-Pack')).toBeInTheDocument();
    expect(screen.getByText(/4-pack · \$30/)).toBeInTheDocument();
    expect(screen.getByText(/6-pack · \$42/)).toBeInTheDocument();
  });

  it('opens product editor when clicking Edit on a product', async () => {
    const user = await loginAndRender();

    // Find the product row for 4-Pack and click Edit
    const productRows = document.querySelectorAll('.admin-event-row');
    let fourPackRow;
    for (const row of productRows) {
      if (row.textContent.includes('4-Pack') && row.textContent.includes('$30')) {
        fourPackRow = row;
        break;
      }
    }
    expect(fourPackRow).toBeDefined();

    const editBtn = within(fourPackRow).getByText('Edit');
    await user.click(editBtn);

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4-Pack')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
  });

  it('opens Add Product modal when clicking + Add Product', async () => {
    const user = await loginAndRender();

    await user.click(screen.getByText('+ Add Product'));

    expect(screen.getByText('Add Product')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/cinnamon roll box/i)).toBeInTheDocument();

    // Verify the modal has price and box size fields
    const modal = document.querySelector('.modal');
    expect(within(modal).getByText(/price \(\$\)/i)).toBeInTheDocument();
    expect(within(modal).getByText(/box size/i)).toBeInTheDocument();
  });

  it('deletes a product when clicking Delete', async () => {
    const user = await loginAndRender();

    // Find the 6-Pack row and delete it
    const productRows = document.querySelectorAll('.admin-event-row');
    let sixPackRow;
    for (const row of productRows) {
      if (row.textContent.includes('6-Pack') && row.textContent.includes('$42')) {
        sixPackRow = row;
        break;
      }
    }
    expect(sixPackRow).toBeDefined();

    const deleteBtn = within(sixPackRow).getByText('Delete');
    await user.click(deleteBtn);

    // 6-Pack should no longer be in the DOM
    expect(screen.queryByText(/6-pack · \$42/)).not.toBeInTheDocument();
  });
});

describe('AdminDashboard – Flavors section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('displays all flavors after login', async () => {
    await loginAndRender();

    expect(screen.getByText('Flavors')).toBeInTheDocument();
    expect(screen.getByText('Classic')).toBeInTheDocument();
    expect(screen.getByText('Matcha')).toBeInTheDocument();
  });

  it('opens flavor editor when clicking Edit on a flavor', async () => {
    const user = await loginAndRender();

    // Find the Classic flavor row
    const allRows = document.querySelectorAll('.admin-event-row');
    let classicRow;
    for (const row of allRows) {
      if (row.textContent.includes('Classic') && row.textContent.includes('/images/classic.jpeg')) {
        classicRow = row;
        break;
      }
    }
    expect(classicRow).toBeDefined();

    const editBtn = within(classicRow).getByText('Edit');
    await user.click(editBtn);

    expect(screen.getByText('Edit Flavor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Classic')).toBeInTheDocument();
    expect(screen.getByDisplayValue('/images/classic.jpeg')).toBeInTheDocument();
  });

  it('opens Add Flavor modal when clicking + Add Flavor', async () => {
    const user = await loginAndRender();

    await user.click(screen.getByText('+ Add Flavor'));

    expect(screen.getByText('Add Flavor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/strawberry cheesecake/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\/images\//i)).toBeInTheDocument();
  });

  it('deletes a flavor when clicking Delete', async () => {
    const user = await loginAndRender();

    const allRows = document.querySelectorAll('.admin-event-row');
    let matchaRow;
    for (const row of allRows) {
      if (row.textContent.includes('Matcha') && row.textContent.includes('/images/matcha.jpeg')) {
        matchaRow = row;
        break;
      }
    }
    expect(matchaRow).toBeDefined();

    const deleteBtn = within(matchaRow).getByText('Delete');
    await user.click(deleteBtn);

    // Matcha image path should no longer appear
    expect(screen.queryByText('/images/matcha.jpeg')).not.toBeInTheDocument();
  });

  it('shows image preview in flavor editor', async () => {
    const user = await loginAndRender();

    const allRows = document.querySelectorAll('.admin-event-row');
    let classicRow;
    for (const row of allRows) {
      if (row.textContent.includes('Classic') && row.textContent.includes('/images/classic.jpeg')) {
        classicRow = row;
        break;
      }
    }

    const editBtn = within(classicRow).getByText('Edit');
    await user.click(editBtn);

    // The modal should have an image preview
    const modal = document.querySelector('.modal');
    const previewImg = modal.querySelector('img[alt="Preview"]');
    expect(previewImg).toBeTruthy();
    expect(previewImg.src).toContain('/images/classic.jpeg');
  });
});
