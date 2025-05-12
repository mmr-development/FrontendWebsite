export const isLoggedIn = () => {
    const token = sessionStorage.getItem('role');
    return token !== null;
}

export const isAdmin = () => {
    const token = sessionStorage.getItem('role');
    return token === 'admin';
}

export const isPartner = () => {
    const token = sessionStorage.getItem('role');
    return token === 'partner';
}