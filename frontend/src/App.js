import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from './screens/ProductScreen';
import { Badge, Button, Container, Nav, NavDropdown, Navbar, } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import { getError } from './util';
import axios from 'axios';
import SearchBox from './component/SearchBox';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoutes from './component/ProtectedRoutes';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './component/AdminRoute';
import SupplierRoute from './component/SupplierRoute';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import InspectorRoute from './component/InspectorRoute';
import Inventory from './screens/Inventory';
import SupplierOrderListScreen from './screens/SupplierOrderList';
import AdminOrderListScreen from './screens/AdminOrderList';
import UserListScreen from './screens/UserListSreen';
import UserEditScreen from './screens/UserEditScreen';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);
  return (
    <BrowserRouter>
      <div
        className={
          sidebarIsOpen
            ? 'site-container active-cont d-flex flex-column'
            : 'site-container d-flex flex-column'
        }
      >
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Button
                variant="dark"
                onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
              >
                <i className="fas fa-bars"></i>
              </Button>
              <LinkContainer to="/">
                <Navbar.Brand>CoupleBuilders</Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls='basic-navbar-nav' />
                <Navbar.Collapse id='basic-navbar-nav'>
                  <SearchBox />
              <Nav className='me-auto w-100 justify-content-end'>
                <Link to="/cart" className='nav-link'>
                  Cart
                  {cart.cartItems.length > 0 && (
                    <Badge pill bg="danger">
                      {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                    </Badge>
                  )}
                </Link>
                {userInfo ? (
                        <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                        <LinkContainer to="/profile">
                          <NavDropdown.Item>User Profile</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/orderhistory">
                          <NavDropdown.Item>Order History</NavDropdown.Item>
                        </LinkContainer>
                        <NavDropdown.Divider />
                        <Link
                          className='dropdown-item'
                          to="#signout"
                          onClick={signoutHandler}
                        >
                          Sign Out
                        </Link>
                      </NavDropdown>
                ) : (
                  <Link className="nav-link" to="/signin">Sign In</Link>
                )};
                {userInfo && userInfo.isAdmin && (
                  <NavDropdown title="Admin" id="admin-nav-dropdown">
                    <LinkContainer to="/admin/dashboard">
                      <NavDropdown.Item>Dashboard</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Divider />
                    <LinkContainer to="/admin/orderlist">
                      <NavDropdown.Item>Orders</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Divider />
                      <LinkContainer to="/admin/userlist">
                      <NavDropdown.Item>Users</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                )};
                {userInfo && userInfo.isSupplier && (
                  <NavDropdown title="Supplier" id="supplier-nav-dropdown">
                    <LinkContainer to="/supplier/orderlist">
                      <NavDropdown.Item>Orders</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Divider />
                    <LinkContainer to="/supplier/products">
                      <NavDropdown.Item>Products</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                )};
                {userInfo && userInfo.isInspector && (
                  <NavDropdown title="Inspector" id="inspector-nav-dropdown">
                    <LinkContainer to="/inspector/inventory">
                      <NavDropdown.Item>Inventory</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                )};
              </Nav>
              </Navbar.Collapse>
          </Container>
          </Navbar>
        </header>
        <div 
          className={
            sidebarIsOpen
              ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
              : 'side-navbar d-flex justify-content-between flex-wrap flex-column'
          }
        >
          <Nav className="flex-column text-white w-100 p-3">
            <Nav.Item>
              <strong className='categories'>Categories</strong>
            </Nav.Item>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer 
                  to={{ pathname: '/search', search: `category=${category}` }}
                  onClick={() => setSidebarIsOpen(false)}
                >
                  <Nav.Link className='sidebar'>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
          </Nav>
        </div>
        <main>
          <Container className='mt-3'>
          <Routes>
            <Route path="/product/:slug" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/signin" element={<SigninScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/profile" element={<ProtectedRoutes><ProfileScreen /></ProtectedRoutes>}/>
            <Route path="/shipping" element={<ShippingAddressScreen />} />
            <Route path="/payment" element={<PaymentMethodScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path="/order/:id" element={<ProtectedRoutes><OrderScreen /></ProtectedRoutes>} />
            <Route path="/orderhistory" element={<ProtectedRoutes><OrderHistoryScreen /></ProtectedRoutes>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><DashboardScreen /></AdminRoute>} />
            <Route path="/admin/orderlist" element={<AdminRoute><AdminOrderListScreen /></AdminRoute>} />
            <Route path="/admin/userlist" element={<AdminRoute><UserListScreen /></AdminRoute>} />
            <Route path="/admin/user/:id" element={<AdminRoute><UserEditScreen /></AdminRoute>} />
            

            {/* Supplier Routes */}
            <Route path="/supplier/orderlist" element={<SupplierRoute><SupplierOrderListScreen /></SupplierRoute>} />
            <Route path="/supplier/products" element={<SupplierRoute><ProductListScreen /></SupplierRoute>} />
            <Route path="/supplier/product/:id" element={<SupplierRoute><ProductEditScreen /></SupplierRoute>} />
            
            {/* Inspector Routes */}
            <Route path='/inspector/inventory' element={<InspectorRoute><Inventory /></InspectorRoute>} />


            <Route path="/" element={<HomeScreen />} />

          </Routes>
          </Container>
        </main>
        <footer>
          <div className='text-center'>All rights reserved</div>
        </footer>
      </div>
    </BrowserRouter>
    );
}

export default App
