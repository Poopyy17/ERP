import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import MessageBox from '../component/MessageBox'
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getError } from '../util';
import { Button, Col, Row, Table } from 'react-bootstrap';
import LoadingBox from '../component/LoadingBox';
import { BsXLg } from 'react-icons/bs'
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { AiFillPrinter } from 'react-icons/ai';
import { FaBook, FaBookmark } from 'react-icons/fa6';

const reducer = (state, action) => {
    switch (action.type) {
      case 'FETCH_REQUEST':
        return { ...state, loading: true };
      case 'FETCH_SUCCESS':
        return { ...state, orders: action.payload, loading: false };
      case 'FETCH_FAIL':
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
  export default function OrderHistoryScreen() {
    const { state } = useContext(Store);
    const { userInfo } = state;
    const navigate = useNavigate();
  
    const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
      loading: true,
      error: '',
    });

    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
      const fetchData = async () => {
        dispatch({ type: 'FETCH_REQUEST' });
        try {
          const { data } = await axios.get(
            `/api/orders/mine`,
  
            { headers: { Authorization: `Bearer ${userInfo.token}` } }
          );

          const sortedOrders = data.sort((a, b) => {
            if (sortOrder === 'asc') {
              return new Date(a.createdAt) - new Date(b.createdAt);
            } else {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
          });

          dispatch({ type: 'FETCH_SUCCESS', payload: data });
        } catch (error) {
          dispatch({
            type: 'FETCH_FAIL',
            payload: getError(error),
          });
        }
      };
      fetchData();
    }, [sortOrder, userInfo]);

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
        <div>
          <Helmet>
            <title>Order History</title>
          </Helmet>
    
          <Row>
            <Col xs={12} md={8}>
              <h1>
                <FaBook /> Order History
              </h1>
            </Col>
            <Col xs={12} md={4} className="d-flex justify-content-end">
              <Button
                variant="outline-success"
                className="ms-auto btn-rectangle"
                onClick={handlePrint}
              >
                <AiFillPrinter /> Print
              </Button>
            </Col>
          </Row>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <div>
              {orders.length === 0 ? (
                <MessageBox>No items in the history.</MessageBox>
              ) : (
                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
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
                        <td>{order._id}</td>
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
                </Table>
              )}
            </div>
          )}
        </div>
      );
    };
    