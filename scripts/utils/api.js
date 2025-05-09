// const apiurl = 'https://10.130.66.11:8080/v1/'
const apiurl = 'https://68fb-185-19-132-68.ngrok-free.app/v1/';
export const includeCredentials = true;

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

export const post = async (path, data, auth = false) => {
    const response = await fetch(getApiUrl(path), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: auth ? 'include' : 'same-origin',
        body: JSON.stringify(data),
    });
    return {
        status: response.status,
        data: await response.json(),
    }
}

export const get = async (path, auth = false) => {
    console.log("auth: " + auth);
    const response = await fetch(getApiUrl(path), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    return {
        status: response.status,
        data: await response.json(),
    }
}

export const put = async (path, data, auth = false) => {
    const response = await fetch(getApiUrl(path), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: auth ? 'include' : 'same-origin',
        body: JSON.stringify(data),
    });
    return {
        status: response.status,
        data: await response.json(),
    };
}

export const patch = async (path, data, auth = false) => {
    const response = await fetch(getApiUrl(path), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: auth ? 'include' : 'same-origin',
        body: JSON.stringify(data),
    });
    return {
        status: response.status,
        data: await response.json(),
    }
}

export const del = async (path, auth = false) => {
    const response = await fetch(getApiUrl(path), {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: auth ? 'include' : 'same-origin',
    });
    return {
        status: response.status,
        data: await response.json(),
    }
}