import NavMenuDrawer from '@/components/navigation/navMenuDrawer';
import { getUserRole } from '@/lib/getUserRole';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const userRole = await getUserRole();
  return (
    <main className="flex h-full w-full">
      <header className="absolute left-5 top-5">
        <NavMenuDrawer userRole={userRole} />
      </header>
      <div className="flex h-full flex-grow items-center justify-center bg-sky-500 p-10 mt-10">{children}</div>
    </main>
  );
};

export default DashboardLayout;
