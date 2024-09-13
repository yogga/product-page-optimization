import { useEffect, useState } from "react";
import { fetchProducts } from "../services/api";
import Link from "next/link";
import styles from "../styles/Home.module.css";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
}

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const getProducts = async () => {
      const productsData = await fetchProducts();
      setProducts(productsData);
      setFilteredProducts(productsData.slice(0, itemsPerPage));
      setCategories(
        Array.from(
          new Set<string>(
            productsData.map((product: Product) => product.category)
          )
        )
      );
      setLoading(false);
    };
    getProducts();
  }, []);

  const filterProducts = (category: string) => {
    setSelectedCategory(category);
    const filtered =
      category === ""
        ? products
        : products.filter((product) => product.category === category);
    setFilteredProducts(filtered.slice(0, itemsPerPage));
    setPage(1);
  };

  const sortProducts = (order: "asc" | "desc") => {
    setSortOrder(order);
    setFilteredProducts((prevProducts) => {
      const sorted = [...prevProducts].sort((a, b) =>
        order === "asc" ? a.price - b.price : b.price - a.price
      );
      return sorted.slice(0, itemsPerPage);
    });
  };

  const loadMore = () => {
    const nextPage = page + 1;
    const start = nextPage * itemsPerPage;
    const end = start + itemsPerPage;
    setFilteredProducts((prevProducts) => [
      ...prevProducts,
      ...products.slice(start, end),
    ]);
    setPage(nextPage);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Products</h1>
      <div>
        <label>Filter by category:</label>
        <select
          className={styles.select}
          onChange={(e) => filterProducts(e.target.value)}
          value={selectedCategory}
        >
          <option value="">All</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <label>Sort by price:</label>
        <select
          className={styles.select}
          onChange={(e) => sortProducts(e.target.value as "asc" | "desc")}
          value={sortOrder}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <ul className={styles.ul}>
        {filteredProducts.map((product) => (
          <li key={product.id} className={styles.li}>
            <Link href={`/product/${product.id}`}>
              <div>
                <h2>{product.title}</h2>
                <p>{product.description}</p>
                <p>{product.price}</p>
                <img
                  className={styles.img}
                  src={product.images[0]}
                  alt={product.title}
                  width={100}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {filteredProducts.length < products.length && (
        <button className={styles.button} onClick={loadMore}>
          Load More
        </button>
      )}
    </div>
  );
};

export default HomePage;
