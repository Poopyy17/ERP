import React, { useContext, useEffect, useReducer } from 'react'
import { Store } from '../Store';
import { getError } from '../util';
import axios from 'axios';
import LoadingBox from '../component/LoadingBox';
import MessageBox from '../component/MessageBox';
import { Card, Col, Row } from 'react-bootstrap';
import { Chart } from 'react-google-charts';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, summary: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, loading: false, error: action.payload };
        
        default:
            return state;
    }
};

export default function DashboardScreen() {
    const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
    });
    const { state } = useContext(Store);
    const { userInfo } = state;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get('/api/orders/summary', {
                    headers: { Authorization: `Bearer ${userInfo.token}`},
                });
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch(err) {
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(err),
                });
            }
        };
        fetchData();
    }, [userInfo]);

  return (
    <div>
        <h1>Dashboard</h1>
        {loading ? (
            <LoadingBox />
        ) : error ? (
            <MessageBox variant ="danger">{error}</MessageBox>
        ) : (
            <>
            <Row>
            <Col md={4}>
            <Card>
                <Card.Body>
                    <Card.Title>
                    {summary.users && summary.users[0] 
                    ? summary.users[0].numUsers
                    : 0}
                    </Card.Title>
                    <Card.Text>Users</Card.Text>
                </Card.Body>
            </Card>
            </Col>
            <Col md={4}>
            <Card>
                <Card.Body>
                    <Card.Title>
                    {summary.orders && summary.orders[0] 
                    ? summary.orders[0].numOrders
                    : 0}
                    </Card.Title>
                    <Card.Text>Total Orders</Card.Text>
                </Card.Body>
            </Card>
            </Col>
            <Col md={4}>
            <Card>
                <Card.Body>
                    <Card.Title>
                    ₱{summary.orders && summary.users[0] 
                    ? summary.orders[0].totalSales.toFixed(2)
                    : 0}
                    </Card.Title>
                    <Card.Text>Total Expenses</Card.Text>
                </Card.Body>
            </Card>
            </Col>
            </Row>
            <div className="my-3">
                <h2>Expenses</h2>
            {summary.dailyOrders.length === 0 ? (
              <MessageBox>No Expenses</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="AreaChart"
                loader={<div><LoadingBox /> Loading chart...</div>}
                data={[
                  ['Date', 'Expense'],
                  ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                ]}
              ></Chart>
            )}
          </div>
        </>
        )}
    </div>
  )
}
