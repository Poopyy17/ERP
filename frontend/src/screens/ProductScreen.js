import { Badge, Button, Card, Col, Form, ListGroup, Row } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import MessageBox from "../component/MessageBox";
import LoadingBox from "../component/LoadingBox";
import axios from "axios";
import { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../Store";
import { getError } from "../util";
import { useNavigate, useParams } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";


function ProductScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedMeasurement, setSelectedMeasurement] = useState('');

  const reducer = (state, action) => {
    switch (action.type) {
      case 'FETCH_REQUEST':
        return { ...state, loading: true };
      case 'FETCH_SUCCESS':
        return { ...state, product: action.payload, loading: false };
      case 'FETCH_FAIL':
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };

  const [{ loading, error, product }, dispatch] = useReducer(reducer, {
    product: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;

  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    const payload = {
      ...product,
      quantity,
      variant: selectedVariant,
      measurement: selectedMeasurement,
    };

    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry, product is out of stock');
      return;
    }

    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload,
    });

    navigate('/cart');
  };

  const formatNumber = (number) => {
    return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Row>
        <Col className="text-left">
          <Button variant="light" onClick={() => navigate(-1)}>
          <IoMdArrowRoundBack />
          </Button>
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={6} className="text-center">
          <div>
            <img
              className="img-large"
              src={selectedImage || product.image}
              alt={product.name}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </Col>
        <Col xs={12} md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h1 className="text-truncate">{product.name}</h1>
            </ListGroup.Item>
            <ListGroup.Item>Price: ₱{formatNumber(product.price)}</ListGroup.Item>
            <ListGroup.Item>
              <Row xs={1} md={2} className="g-2">
                {[product.image, ...product.images].map((x) => (
                  <Col key={x} xs={6} md={4}>
                    <Card>
                      <Button
                        className="thumbnail"
                        type="button"
                        variant="light"
                        onClick={() => setSelectedImage(x)}
                      >
                        <Card.Img variant="top" src={x} alt="product" />
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              Description:
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col xs={12} md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <Badge bg="success">In Stock</Badge>
                      ) : (
                        <Badge bg="danger">Unavailable</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {product.variants && product.variants.length > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Variants:</Col>
                      <Col>
                        <Form.Select
                          value={selectedVariant}
                          onChange={(e) => setSelectedVariant(e.target.value)}
                        >
                          <option value="">Default</option>
                          {product.variants.map((variant, index) => (
                            <option key={variant} value={variant}>
                              {variant}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}

                {product.measurements && product.measurements.length > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Measurements:</Col>
                      <Col>
                        <Form.Select
                          value={selectedMeasurement}
                          onChange={(e) => setSelectedMeasurement(e.target.value)}
                        >
                          <option value="">Default</option>
                          {product.measurements.map((measurement, index) => (
                            <option key={measurement} value={measurement}>
                              {measurement}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}

                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button onClick={addToCartHandler} variant="primary" size="lg" block>
                        Add to Cart
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

export default ProductScreen;
