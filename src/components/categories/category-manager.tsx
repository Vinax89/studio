"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCategories } from "./categories-context";
import { Pencil, Trash2 } from "lucide-react";

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManager({ open, onOpenChange }: CategoryManagerProps) {
  const { categories, addCategory, removeCategory, updateCategory } =
    useCategories();
  const [newCategory, setNewCategory] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    const value = newCategory.trim();
    if (!value) return;
    addCategory(value);
    setNewCategory("");
  };

  const startEdit = (cat: string) => {
    setEditing(cat);
    setEditValue(cat);
  };

  const handleEdit = (cat: string) => {
    const value = editValue.trim();
    if (!value) return;
    updateCategory(cat, value);
    setEditing(null);
    setEditValue("");
  };

  const handleDelete = (cat: string) => {
    removeCategory(cat);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category"
            />
            <Button onClick={handleAdd} disabled={!newCategory.trim()}>
              Add
            </Button>
          </div>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <li key={cat} className="flex items-center gap-2">
                {editing === cat ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={() => handleEdit(cat)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 capitalize">{cat}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(cat)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
