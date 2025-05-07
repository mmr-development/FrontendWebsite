const apiurl = 'http://10.130.66.11:8080/v1/'

const validateUrl = (url) => {
    if (!url.includes('?') && !url.endsWith('/')) {
        return url + '/';
    }
    else if (url.includes('?') && !url.substring(url.indexOf('?') - 1, url.indexOf('?')).endsWith('/')) {
        return url.substring(0, url.indexOf('?')) + '/' + url.substring(url.indexOf('?'));
    }
    return url;
}

const getApiUrl = (path) => {
    return validateUrl(apiurl + path);
}

export const post = async (path, data) => {
    const response = await fetch(getApiUrl(path), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return {
        status: response.status,
        data: await response.json(),
    }
}

export const get = async (path) => {
    const response = await fetch(getApiUrl(path), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    return {
        status: response.status,
        data: await response.json(),
    }
}

export const put = async (path, data) => {
    const response = await fetch(getApiUrl(path), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return {
        status: response.status,
        data: await response.json(),
    };
}

export const patch = async (path, data) => {
    const response = await fetch(getApiUrl(path), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return {
        status: response.status,
        data: await response.json(),
    }
}

export const del = async (path) => {
    const response = await fetch(getApiUrl(path), {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return {
        status: response.status,
        data: await response.json(),
    }
}