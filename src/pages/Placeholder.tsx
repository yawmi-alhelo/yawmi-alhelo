import { Construction } from 'lucide-react';
import Layout from '../components/Layout';

export default function Placeholder({ title }: { title: string }) {
  return (
    <Layout>
      <div className="card-soft text-center py-16 mt-8">
        <Construction size={48} className="mx-auto text-rose-300 mb-4" />
        <h2 className="text-xl font-bold text-ink-900 dark:text-rose-100 mb-2">{title}</h2>
        <p className="text-sm text-ink-500 dark:text-rose-300/80">قيد التطوير — قريباً 💗</p>
      </div>
    </Layout>
  );
}
