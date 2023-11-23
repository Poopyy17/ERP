import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../component/LoadingBox';
import MessageBox from '../component/MessageBox';
import { Store } from '../Store';
import { getError } from '../util';
import { BsXLg } from 'react-icons/bs'
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { Col, Row } from 'react-bootstrap';
import { FaTrash } from "react-icons/fa6";
import { AiFillPrinter } from 'react-icons/ai';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        orders: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

export default function AdminOrderListScreen() {

  const [selectedOrders, setSelectedOrders] = useState([]);
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const [sortOrder, setSortOrder] = useState('asc');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        const sortedOrders = data.sort((a, b) => {
          if (sortOrder === 'asc') {
            return new Date(a.createdAt) - new Date(b.createdAt);
          } else {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
        });
      
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete, sortOrder]);

  const deleteHandler = async () => {
    if (window.confirm('Delete selected orders?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
  
        // Send an array of selected order IDs to the server
        await axios.delete(`/api/orders`, {
          data: { orderIds: selectedOrders },
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
  
        toast.success('Selected orders deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
        setSelectedOrders([]); // Clear selected orders after deletion
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  const handleOrderSelection = (order) => {
    if (selectedOrders.includes(order._id)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== order._id));
    } else {
      setSelectedOrders([...selectedOrders, order._id]);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const formatNumber = (number) => {
    return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePrint = () => {
    window.print();
  };


  return (
    <div className="container">
      <Helmet>
        <title>Orders</title>
      </Helmet>
      <Row className="mt-3">
        <Col xs={12} md={6}>
          <h1>Orders</h1>
        </Col>
        <Col xs={12} md={6} className="text-end">
          <div>
            <Button
              type="button"
              className="btn btn-danger"
              onClick={deleteHandler}
              disabled={selectedOrders.length === 0}
            >
              <FaTrash /> Delete Orders
            </Button>
            &nbsp;
            <Button
              variant="outline-success"
              className="btn btn-primary"
              onClick={handlePrint}
            >
              <AiFillPrinter />
            </Button>
          </div>
        </Col>
      </Row>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <div>
          {orders.length === 0 ? (
            <MessageBox>No orders available.</MessageBox>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th></th>
                    <th>ID</th>
                    <th>USER</th>
                    <th>
                      DATE
                      <Button
                        variant="transparent"
                        size="sm"
                        onClick={toggleSortOrder}
                      >
                        {sortOrder === 'asc' ? <FaCaretUp /> : <FaCaretDown />}
                      </Button>
                    </th>
                    <th>TOTAL</th>
                    <th>PAID</th>
                    <th>DELIVERED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => handleOrderSelection(order)}
                        />
                      </td>
                      <td>{order._id}</td>
                      <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                      <td>{order.createdAt.substring(0, 10)}</td>
                      <td>{formatNumber(order.totalPrice)}</td>
                      <td>{order.isPaid ? order.paidAt.substring(0, 10) : <BsXLg />}</td>
                      <td>
                        {order.isDelivered
                          ? order.deliveredAt.substring(0, 10)
                          : <BsXLg />}
                      </td>
                      <td>
                        <Button
                          type="button"
                          variant="light"
                          onClick={() => {
                            navigate(`/order/${order._id}`);
                          }}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}