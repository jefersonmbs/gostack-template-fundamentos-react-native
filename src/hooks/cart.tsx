import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
  formatPrice?: string;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const loadProduct = await AsyncStorage.getItem('@GoMarketPlace:product');

      if (loadProduct) {
        setProducts(JSON.parse(loadProduct));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const prodIndex = products.indexOf(product);

      if (prodIndex < 0) {
        await AsyncStorage.setItem(
          '@GoMarketPlace:product',
          JSON.stringify([...products, product]),
        );
        setProducts([...products, product]);
      } else {
        products[prodIndex].quantity += 1;
        setProducts([...products]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // INCREMENTS A PRODUCT QUANTITY IN THE CART
      const pos = products.findIndex(item => item.id === id);
      products[pos].quantity += 1;
      await AsyncStorage.setItem(
        '@GoMarketPlace:product',
        JSON.stringify([...products]),
      );
      setProducts([...products]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // DECREMENTS A PRODUCT QUANTITY IN THE CART
      const pos = products.findIndex(item => item.id === id);

      if (products[pos].quantity === 1) {
        products.splice(pos, 1);
        await AsyncStorage.setItem(
          '@GoMarketPlace:product',
          JSON.stringify([...products]),
        );
        setProducts([...products]);
      } else {
        products[pos].quantity -= 1;

        await AsyncStorage.setItem(
          '@GoMarketPlace:product',
          JSON.stringify([...products]),
        );
        setProducts([...products]);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
