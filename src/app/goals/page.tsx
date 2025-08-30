'use client';
import Goals from '@/components/Goals';
export default function GoalsPage(){
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Goals</h1>
      <Goals />
    </div>
  );
}
