import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import LoadingBox from '../component/LoadingBox';
import MessageBox from '../component/MessageBox';
import { Button, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getError } from '../util';

const reducer = (state, action) => {
    switch (action.type) {
      case 'FETCH_REQUEST':
        return { ...state, loading: true };
      case 'FETCH_SUCCESS':
        return {
          ...state,
          products: action.payload.products,
          page: action.payload.page,
          pages: action.payload.pages,
          loading: false,
        };
      case 'FETCH_FAIL':
        return { ...state, loading: false, error: action.payload };
      case 'CREATE_REQUEST':
        return { ...state, loadingCreate: true };
      case 'CREATE_SUCCESS':
        return {
          ...state,
          loadingCreate: false,
        };
      case 'CREATE_FAIL':
        return { ...state, loadingCreate: false };
  
      case 'DELETE_REQUEST':
        return { ...state, loadingDelete: true, successDelete: false };
      case 'DELETE_SUCCESS':
        return {
          ...state,
          loadingDelete: false,
          successDelete: true,
        };
      case 'DELETE_FAIL':
        return { ...state, loadingDelete: false, successDelete: false };
  
      case 'DELETE_RESET':
        return { ...state, loadingDelete: false, successDelete: false };
      default:
        return state;
    }
  };


export default function ProductListScreen() {

    

    const [{ loading, error, products, pages, loadingCreate, loadingDelete, successDelete }, dispatch] =
        useReducer(reducer, {
        loading: true,
        error: '',
    });

    const navigate = useNavigate();
    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const page = sp.get('page') || 1;

    const { state } = useContext(Store);
    const { userInfo } = state;

    useEffect(() => {
        const fetchData = async () => {
          try {
            const { data } = await axios.get(`/api/products/supplier?page=${page} `, {
              headers: { Authorization: `Bearer ${userInfo.token}` },
            });
    
            dispatch({ type: 'FETCH_SUCCESS', payload: data });
          } catch (err) {}
        };
    
        if (successDelete) {
          dispatch({ type: 'DELETE_RESET' });
        } else {
          fetchData();
        }
      }, [page, userInfo, successDelete]);

    const createHandler = async () => {
          try {
            dispatch({ type: 'CREATE_REQUEST' });
            const { data } = await axios.post(
              '/api/products',
              {},
              {
                headers: { Authorization: `Bearer ${userInfo.token}` },
              }
            );
            toast.success('product created successfully');
            dispatch({ type: 'CREATE_SUCCESS' });
            navigate(`/supplier/product/${data.product._id}`);
          } catch (err) {
            toast.error(getError(error));
            dispatch({
              type: 'CREATE_FAIL',
            });
          }
      };

    const deleteHandler = async (product) => {
        if (window.confirm('Are you sure remove this item?')) {
          try {
            await axios.delete(`/api/products/${product._id}`, {
              headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            toast.success('Product Removed!');
            dispatch({ type: 'DELETE_SUCCESS' });
          } catch (err) {
            toast.error(getError(error))
            dispatch({
              type: 'DELETE_FAIL',
            });
          }
        }
      };

  return (
    <div>
        <Row>
            <Col><h1>Products</h1></Col>
            <Col className="col text-end">
                <div>
                    <Button type="button" onClick={createHandler}>
                        Create Product
                    </Button>
                </div>
            </Col>
        </Row>
        
        {loadingCreate && <LoadingBox></LoadingBox>}
        {loadingDelete && <LoadingBox></LoadingBox>}

        {loading ? (
            <LoadingBox></LoadingBox>
        ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
        ) : (
            <>
            <table className='table'>
                <thead>
                    <tr>
                        <th>NAME</th>
                        <th>PRICE</th>
                        <th>CATEGORY</th>
                        <th>STOCKS</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                {products.map((product) => (
                    <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>₱{product.price}</td>
                        <td>{product.category}</td>
                        <td>{product.countInStock}</td>
                        <td>
                        <Button 
                                type='button'
                                variant='light'
                                onClick={() => navigate(`/supplier/product/${product._id}`)}
                            >
                                Edit
                            </Button>
                            &nbsp;
                            <Button
                                type="button"
                                variant="light"
                                onClick={() => deleteHandler(product)}
                            >
                                <i className="fas fa-trash"></i>
                            </Button>
                        </td>
                        
                    </tr>
                ))}
                </tbody>
            </table>
            <div>
                {[...Array(pages).keys()].map((x) => (
                    <Link 
                        className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                        key={x + 1}
                        to={`/supplier/products?page=${x + 1}`}
                    >
                        {x + 1}
                    </Link>
                ))}
            </div>
            </>
        )}
    </div>
  )
}
