import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';


export function MainLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header title={title} />
        <main className="p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
