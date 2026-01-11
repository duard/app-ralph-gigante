import React from 'react';

type ProductRow = {
  code: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  category?: string;
  id?: string;
};

const ProductTable: React.FC<{ products?: ProductRow[] }> = ({ products = [] }) => {
  return (
    <table aria-label="Produtos">
      <thead>
        <tr>
          <th>Código</th>
          <th>Nome</th>
          <th>Preço</th>
          <th>Estoque</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {products.length === 0 ? (
          <tr>
            <td colSpan={5}>Nenhum produto disponível</td>
          </tr>
        ) : (
          products.map((p, idx) => (
            <tr key={p.id ?? idx}>
              <td>{p.code}</td>
              <td>{p.name}</td>
              <td>{p.price.toLocaleString(undefined, { style: 'currency', currency: 'BRL' })}</td>
              <td>{p.stock}</td>
              <td>{p.status}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default ProductTable;
