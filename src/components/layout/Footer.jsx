function Footer() {
    return (
        <footer style={{
            backgroundColor: '#1a1a2e',
            color: '#aaa',
            textAlign: 'center',
            padding: '20px',
            marginTop: 'auto'
        }}>
            <p>© 2026 E-Ticaret — Tüm hakları saklıdır.</p>
            <div style={{ marginTop: '8px', fontSize: '13px' }}>
                <a href="#" style={{ color: '#aaa', marginRight: '15px' }}>Gizlilik Politikası</a>
                <a href="#" style={{ color: '#aaa', marginRight: '15px' }}>Kullanım Koşulları</a>
                <a href="#" style={{ color: '#aaa' }}>İletişim</a>
            </div>
        </footer>
    );
}

export default Footer;