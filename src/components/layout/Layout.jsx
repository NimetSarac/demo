import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ children }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'   // footer her zaman en altta
        }}>
            <Navbar />

            <main style={{
                flex: 1,
                padding: '20px 30px'
            }}>
                {children}
            </main>

            <Footer />
        </div>
    );
}

export default Layout;