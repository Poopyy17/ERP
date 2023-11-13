import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import LoadingBox from '../component/LoadingBox';
import MessageBox from '../component/MessageBox';
import { Store } from '../Store';
import { getError } from '../util';
import { toast } from 'react-toastify';
import { Button } from 'react-bootstrap';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
      case 'PAY_FAIL':
        return { ...state, loadingPay: false, errorPay: action.payload };
      case 'PAY_RESET':
        return { ...state, loadingPay: false, successPay: false };
      case 'DELIVER_REQUEST':
        return { ...state, loadingDeliver: true };
      case 'DELIVER_SUCCESS':
        return { ...state, loadingDeliver: false, successDeliver: true };
      case 'DELIVER_FAIL':
        return { ...state, loadingDeliver: false };
      case 'DELIVER_RESET':
        return { ...state, loadingDeliver: false, successDeliver: false }
      case 'MARK_REQUEST':
        return { ...state, loadingMark: true };
      case 'MARK_SUCCESS':
        return { ...state, loadingMark: false, markDeliver: true };
      case 'MARK_FAIL':
        return { ...state, loadingMark: false };
      case 'MARK_RESET':
        return { ...state, loadingMark: false, markDeliver: false }

    default:
      return state;
  }
}

export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
      loadingMark,
      markDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
  });

  const [{ isPending }, paypalDispatch ] =usePayPalScriptReducer();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions){
    return actions.order.capture().then(async function (details) {
      try {
        dispatch ({ type: 'PAY_REQUEST'});
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: 'PAY_SUCCESS', payload: data })
        toast.success('Order is paid');
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }
  function onError(err) {
    toast.error(getError(err));
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      markDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
      if (markDeliver) {
        dispatch({ type: 'MARK_RESET' });
      }
      } else {
        const loadPayPalScript = async () => {
          const { data: clientId } = await axios.get('/api/keys/paypal', {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          paypalDispatch({
            type: 'resetOptions',
            value: {
              'client-id': clientId,
              currency: 'PHP',
            },
          });
          paypalDispatch({ type: 'setLoadingStatus', value: 'pending' })
        }
        loadPayPalScript();
      }
    }, [
    order,
    userInfo,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    successDeliver,
    markDeliver,
    ]);

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST'});
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      toast.success('Order is Delivered')
    } catch(err) {
      toast.error(getError(err));
      dispatch({ type: 'DELIVER_FAIL' });
    }
  }
  async function markDeliveredHandler() {
    try {
      dispatch({ type: 'MARK_REQUEST' });
      const { data } = await axios.put(
        `/api/orders/${order._id}/markdeliver`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'MARK_SUCCESS', payload: data });
      toast.success('Order marked as delivered!')
    } catch(err) {
      toast.error(getError(err));
      dispatch({ type: 'MARK_FAIL' });
    }
  }
  

  const formatNumber = (number) => {
    return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  function formatQuantity(quantity) {
    return quantity.toLocaleString();
  }

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
     <Helmet>
        <title>Order {orderId}</title>
     </Helmet>
     <h1 className="my-3">Order {orderId}</h1>
     <Row>
        <Col md={8}>
            <Card className='mb-3'>
                <Card.Body>
                    <Card.Title>Shipping</Card.Title>
                    <Card.Text>
                    <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                    <strong>Address: </strong> {order.shippingAddress.address},
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                    </Card.Text>
                    {order.isDelivered ? (
                        <MessageBox variant="success">
                            <strong>Supplier:</strong> Shipped out {order.deliveredAt}
                        </MessageBox>
              ) : (
                <MessageBox variant="danger"><strong>Supplier:</strong> Preparing...</MessageBox>
              )}
              {order.markDelivered ? (
                        <MessageBox variant="success">
                            <strong>Inspector:</strong> Marked as Delivered {order.deliveredAt}
                        </MessageBox>
              ) : (
                <MessageBox variant="danger"><strong>Inspector:</strong> Waiting for the order...</MessageBox>
              )}
                </Card.Body>
            </Card>
            <Card className='mb-3'>
                <Card.Body>
                    <Card.Title>Payment</Card.Title>
                    <Card.Text>
                    <strong>Method:</strong> {order.paymentMethod}
                    </Card.Text>
                    {order.isPaid ? (
                        <MessageBox variant="success">
                            Paid at {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Paid</MessageBox>
              )}
                </Card.Body>
            </Card>
            <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link style={{textDecoration: 'none'}} to={`/product/${item.slug}`} className='item'>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{formatQuantity(item.quantity)}</span>
                      </Col>
                      <Col md={3}><strong>₱{formatNumber(Number(item.price))}</strong></Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>₱{formatNumber(order.itemsPrice)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>₱{formatNumber(order.shippingPrice)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>₱{formatNumber(order.taxPrice)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>₱{formatNumber(order.totalPrice)}</strong>
                    </Col>
                        </Row>
                    </ListGroup.Item>
                    {!order.isPaid && (
                      <ListGroup.Item>
                        {isPending ? (
                          <LoadingBox />
                        ) : (
                          <div>
                            <PayPalButtons
                              createOrder={createOrder}
                              onApprove={onApprove}
                              onError={onError}
                            ></PayPalButtons>
                          </div>
                        )}
                        {loadingPay && <LoadingBox></LoadingBox>}
                      </ListGroup.Item>
                    )}
                      {userInfo.isSupplier && order.isPaid && !order.isDelivered && (
                        <ListGroup.Item>
                          {loadingDeliver && <LoadingBox></LoadingBox>}
                          <div className='d-grid'>
                            <Button type='button' onClick={deliverOrderHandler}>
                              Ship out Order  
                            </Button>
                          </div>
                        </ListGroup.Item>
                      )}
                      {userInfo.isInspector && order.isPaid && !order.markDelivered && (
                        <ListGroup.Item>
                          {loadingMark && <LoadingBox></LoadingBox>}
                          <div className='d-grid'>
                            <Button type='button' onClick={markDeliveredHandler}>
                              Mark as Delivered
                            </Button>
                          </div>
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </div>
  );
}