const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || 'API request failed');
  }

  return response.json();
}

// ============ PRODUCTS ============

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  category_type: string;
  description: string;
  image: string | null;
}

export interface ProductVariant {
  id: number;
  name: string;
  storage: string;
  color: string;
  ram: string;
  price_adjustment: string;
  price: string;
  original_price?: string;
  stock: number;
  sku: string;
  final_price: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: Brand | null;
  description: string;
  short_description?: string;
  specifications: string;
  price: string;
  original_price?: string;
  sale_price: string | null;
  current_price: string;
  category: Category;
  product_type: string;
  image: string;
  images: { id: number; image: string; alt_text: string; is_primary: boolean }[];
  variants: ProductVariant[];
  stock: number;
  in_stock: boolean;
  is_featured: boolean;
  is_unique_variant: boolean;
  reviews: Review[];
  average_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const productsAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchAPI<{ results: Product[]; count: number }>(`/products/${query}`);
  },
  getBySlug: (slug: string) => fetchAPI<Product>(`/products/${slug}/`),
  getByType: (type: string) => fetchAPI<{ results: Product[]; count: number }>(`/products/?type=${type}`),
};

export const categoriesAPI = {
  getAll: () => fetchAPI<Category[]>('/categories/'),
  getByType: (type: string) => fetchAPI<Category[]>(`/categories/?type=${type}`),
};

export const brandsAPI = {
  getAll: () => fetchAPI<Brand[]>('/brands/'),
};

// ============ MSME FINANCING ============

export interface FinancingPlan {
  id: number;
  months: number;
  interest_rate: string;
  is_active: boolean;
}

export interface FinancingApplication {
  id: number;
  application_id: string;
  application_type: 'individual' | 'salaried';
  product: Product;
  variant: ProductVariant | null;
  financing_plan: FinancingPlan;
  full_name: string;
  status: string;
  approved_amount: string | null;
  monthly_payment: string | null;
  created_at: string;
}

export const financingAPI = {
  getPlans: () => fetchAPI<FinancingPlan[]>('/financing/plans/'),
  createApplication: (data: Record<string, unknown> | FormData) => {
    if (data instanceof FormData) {
      return fetch(`${API_BASE_URL}/financing/applications/`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      }).then(res => res.json());
    }
    return fetchAPI<FinancingApplication>('/financing/applications/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  submitToBank: (applicationId: string) =>
    fetchAPI<FinancingApplication>(`/financing/applications/${applicationId}/submit_to_bank/`, {
      method: 'POST',
    }),
  confirmApplication: (applicationId: string) =>
    fetchAPI<FinancingApplication>(`/financing/applications/${applicationId}/confirm/`, {
      method: 'POST',
    }),
};

// ============ EMPLOYERS ============

export interface Employer {
  id: number;
  name: string;
  code: string | null;
}

export const employersAPI = {
  getAll: () => fetchAPI<Employer[]>('/employers/'),
};

// ============ ENTERPRISE ============

export interface EnterpriseBundle {
  id: number;
  product: Product;
  name: string;
  data_gb: number;
  minutes: number;
  sms: number;
  minimum_quantity: number;
  price_per_device: string;
  additional_perks: string[];
  is_active: boolean;
}

export interface EnterpriseOrder {
  id: number;
  order_id: string;
  bundle: EnterpriseBundle;
  quantity: number;
  company_name: string;
  status: string;
  approved_amount: string | null;
  total_amount: string;
  lead_time_days: number;
  created_at: string;
}

export const enterpriseAPI = {
  getBundles: () => fetchAPI<{ results: EnterpriseBundle[] }>('/enterprise/bundles/'),
  createOrder: (data: Record<string, unknown>) =>
    fetchAPI<EnterpriseOrder>('/enterprise/orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  creditCheck: (orderId: string) =>
    fetchAPI<EnterpriseOrder>(`/enterprise/orders/${orderId}/credit_check/`, {
      method: 'POST',
    }),
};

// ============ EDUCATION ============

export interface EducationBoard {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  price: string;
  installation_included: boolean;
  specifications: string;
  is_active: boolean;
}

export interface ClassroomPackage {
  id: number;
  name: string;
  slug: string;
  description: string;
  boards_included: number;
  price: string;
  installation_included: boolean;
  is_active: boolean;
}

export interface School {
  id: number;
  name: string;
  location: string;
  county: string;
  school_type: string;
}

export interface Fundraiser {
  id: number;
  fundraiser_id: string;
  fundraiser_type: 'single_board' | 'classroom';
  school_name: string;
  school_location: string;
  school_description: string;
  target_amount: string;
  current_amount: string;
  progress_percentage: number;
  share_link: string;
  status: string;
  creator: string;
  donations: Donation[];
  leaderboard: { name: string; amount: string }[];
  created_at: string;
  end_date: string | null;
}

export interface Donation {
  id: number;
  donation_id: string;
  donor_name: string;
  amount: string;
  status: string;
  created_at: string;
}

export interface DonationAmount {
  id: number;
  amount_usd: string;
}

export interface EducationTablet {
  id: number;
  name: string;
  slug: string;
  brand: string;
  size: string;
  description: string;
  specifications: string;
  image: string;
  price: string;
  stock: number;
  is_active: boolean;
}

export interface TabletSoftware {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  is_default: boolean;
}

export const educationAPI = {
  getBoards: () => fetchAPI<{ results: EducationBoard[] }>('/education/boards/'),
  getPackages: () => fetchAPI<{ results: ClassroomPackage[] }>('/education/packages/'),
  getDonationAmounts: () => fetchAPI<DonationAmount[]>('/education/donation-amounts/'),
  getFundraisers: () => fetchAPI<{ results: Fundraiser[] }>('/education/fundraisers/'),
  getFundraiser: (shareLink: string) => fetchAPI<Fundraiser>(`/education/fundraisers/${shareLink}/`),
  createFundraiser: (data: Record<string, unknown>, token: string) =>
    fetchAPI<Fundraiser>('/education/fundraisers/', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
  donate: (shareLink: string, data: Record<string, unknown>) =>
    fetchAPI<Donation>(`/education/fundraisers/${shareLink}/donate/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTablets: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchAPI<{ results: EducationTablet[] }>(`/education/tablets/${query}`);
  },
  getSoftware: () => fetchAPI<{ results: TabletSoftware[] }>('/education/tablet-software/').then(res => res.results || []),
  getSchools: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchAPI<School[]>(`/schools/${query}`);
  },
};

// ============ CART ============

export interface CartItem {
  id: number;
  product: Product | null;
  variant: ProductVariant | null;
  education_tablet: EducationTablet | null;
  quantity: number;
  unit_price: string;
  total_price: string;
  item_name: string;
  item_type: 'product' | 'education_tablet';
}

export interface Cart {
  id: number;
  cart_id: string;
  items: CartItem[];
  total: string;
  item_count: number;
}

export const cartAPI = {
  get: (token?: string) => fetchAPI<Cart>('/cart/', { token }),
  addItem: (productId: number, variantId?: number, quantity = 1, token?: string) =>
    fetchAPI<Cart>('/cart/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, variant_id: variantId, quantity }),
      token,
    }),
  addEducationTablet: (tabletId: number, quantity = 1, token?: string) =>
    fetchAPI<Cart>('/cart/', {
      method: 'POST',
      body: JSON.stringify({ education_tablet_id: tabletId, quantity }),
      token,
    }),
  updateItem: (itemId: number, quantity: number, token?: string) =>
    fetchAPI<Cart>(`/cart/items/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
      token,
    }),
  removeItem: (itemId: number, token?: string) =>
    fetchAPI<Cart>(`/cart/items/${itemId}/`, {
      method: 'DELETE',
      token,
    }),
  clear: (token?: string) => fetchAPI<{ message: string }>('/cart/', { method: 'DELETE', token }),
};

// ============ ORDERS ============

export interface OrderItem {
  id: number;
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface Order {
  id: number;
  order_id: string;
  full_name: string;
  email: string;
  phone: string;
  town: string;
  address: string;
  subtotal: string;
  shipping_cost: string;
  total: string;
  status: string;
  payment_status: string;
  tracking_number: string;
  items: OrderItem[];
  created_at: string;
}

export const ordersAPI = {
  create: (data: Record<string, unknown>, token?: string) =>
    fetchAPI<Order>('/orders/', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
  getAll: (token: string) =>
    fetchAPI<{ results: Order[] }>('/orders/', { token }),
  get: (orderId: string, token: string) =>
    fetchAPI<Order>(`/orders/${orderId}/`, { token }),
};

// ============ AUTH ============

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    user_type: string;
    phone: string;
    company_name: string;
    school_name: string;
    alumni_school: string;
    is_salaried_employee: boolean;
    employer: number | null;
    employer_name: string | null;
    staff_number: string;
  };
}

export const authAPI = {
  login: (username: string, password: string) =>
    fetchAPI<{ user: User; token: string }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (data: Record<string, unknown>) =>
    fetchAPI<{ user: User; token: string }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: (token: string) =>
    fetchAPI<{ message: string }>('/auth/logout/', {
      method: 'POST',
      token,
    }),
  getUser: (token: string) =>
    fetchAPI<User>('/auth/user/', { token }),
};
