import { useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { auth } from 'config/firebase';

type Props = {
    children: ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({ children }) => {
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const isAuthRoute = router.pathname === '/auth/signin' || router.pathname === '/auth/signup';
            if (!user && !isAuthRoute) {
                router.push('/auth/signin');
            }
        });

        // Cleanup the listener on component unmount
        return () => {
            unsubscribe();
        };
    }, [router]);

    return <>{children}</>;
};

export default ProtectedRoute;
