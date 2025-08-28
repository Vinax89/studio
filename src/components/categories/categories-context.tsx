"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  addCategory as persistAdd,
  removeCategory as persistRemove,
  getCategories as loadCategories,
} from "@/lib/categories";

interface CategoriesContextValue {
  categories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  updateCategory: (oldCategory: string, newCategory: string) => void;
}

const CategoriesContext = createContext<CategoriesContextValue | undefined>(
  undefined
);

export function CategoriesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    setCategories(loadCategories());
  }, []);

  const addCategory = (category: string) => {
    const updated = persistAdd(category);
    setCategories([...updated]);
  };

  const removeCategory = (category: string) => {
    const updated = persistRemove(category);
    setCategories([...updated]);
  };

  const updateCategory = (oldCategory: string, newCategory: string) => {
    const withoutOld = persistRemove(oldCategory);
    const withNew = persistAdd(newCategory);
    // persistAdd already returns updated list, but we called remove first
    // to ensure casing updates. So merge withoutOld into withNew.
    setCategories([...withNew]);
  };

  return (
    <CategoriesContext.Provider
      value={{ categories, addCategory, removeCategory, updateCategory }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return ctx;
}
