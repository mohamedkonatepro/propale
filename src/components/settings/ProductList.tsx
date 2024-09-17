import { Product } from '@/types/models';
import React from 'react';
import { FaRegTrashAlt, FaPlus } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

interface ProductListProps {
  products: Product[];
  updateProducts: (products: Product[]) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, updateProducts }) => {
  const addProduct = () => {
    updateProducts([...products, { id: uuidv4(), name: '', price: 0, quantity: 0 }]);
  };

  const updateProduct = (index: number, field: keyof Product, value: string | number) => {
    const updatedProducts = products.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    );
    updateProducts(updatedProducts);
  };

  const deleteProduct = (index: number) => {
    updateProducts(products.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-labelGray mb-2">Produits</h4>
      {products.map((product, index) => (
        <div key={index} className="flex items-center mb-2 w-full">
          <input
            value={product.name}
            onChange={(e) => updateProduct(index, 'name', e.target.value)}
            placeholder="Nom du produit"
            className="mr-2 rounded p-2 bg-backgroundGray w-3/5"
            type="text"
          />
          <input
            value={product.price}
            onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value))}
            placeholder="Prix/TJM"
            className="mr-2 rounded p-2 bg-backgroundGray"
            type="number"
          />
          <input
            value={product.quantity}
            onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
            placeholder="JH"
            className="mr-2 rounded p-2 bg-backgroundGray"
            type="number"
          />
          <button
            type="button"
            onClick={() => deleteProduct(index)}
            className="rounded px-2 py-1"
          >
            <FaRegTrashAlt className="text-red-500" size={20} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addProduct}
        className="mt-2 bg-blueCustom text-white rounded px-4 py-2 flex items-center"
      >
        <FaPlus size={20} /> <div className='ml-2'>Ajouter un produit</div>
      </button>
    </div>
  );
};

export default ProductList;