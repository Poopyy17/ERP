import { Link } from "react-router-dom";
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import { Store } from "../Store";
import { useContext } from "react";
import axios from "axios";

function Product(props) {
    const { product } = props;

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        cart: { cartItems },
    } = state;

        const AddToCartHandler = async (item) => {
            const existItem = cartItems.find((x) => x._id === product._id);
            const quantity = existItem ? existItem.quantity + 1 : 1;
            const { data } = await axios.get(`api/products/${item._id}`);
            if (data.countInStock < quantity) {
                window.alert("Sorry, product is out of stock");
                return;
            }
            ctxDispatch({
                type: 'CART_ADD_ITEM', 
                payload: {...item, quantity },
            });
        };

    return (
        <Card className="product" >
            
              <Link to={`/product/${product.slug}`}>
                 <div className="img-bg">
                    <img src={product.image} className="card-img-top fixed" alt={product.name} />
                </div>
              </Link>
          
              <Card.Body>
              <Link style={{textDecoration: 'none'}} to={`/product/${product.slug}`}>
                <div className="text-muted">
                    <Card.Title>{product.name}</Card.Title>
                </div>
              </Link>
              <Card.Text className="price">₱{product.price}</Card.Text>
              <div className="text-center">
                {product.countInStock === 0 ? (
                    <Button variant="light" disabled>
                        Out of stock
                    </Button>
                ) : (
                    <Button onClick={() => AddToCartHandler(product)} className="btn btn-primary w-75"><i className="fas fa-cart-plus"></i> Add to cart</Button>
                )}
              </div>
              </Card.Body>
            </Card>
    )
}

export default Product