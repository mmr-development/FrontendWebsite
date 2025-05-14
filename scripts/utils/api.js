// const apiurl = 'https://10.130.66.11:8080/v1/'
const apiurl = 'https://74d7-212-27-16-17.ngrok-free.app/v1/';
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

const reauthenticate = async () => {
    await fetch(getApiUrl('auth/refresh-token/'), {
        method: 'POST',
        credentials: 'include',
    });
}

const getApiUrl = (path) => {
    return validateUrl(apiurl + path);
}

export const post = async (path, data, auth = false, tried = false) => {
    const response = await fetch(getApiUrl(path), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials:'include',
        body: JSON.stringify(data),
    });
    if(response.status === 401 && !tried) {
        await reauthenticate();
        return await post(path, data, auth, true);
    }
    return {
        status: response.status,
        data: await response.json(),
    }
}

export const get = async (path, auth = false, tried = false) => {
    const response = await fetch(getApiUrl(path), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if(response.status === 401 && !tried) {
        await reauthenticate();
        return await get(path, auth, true);
    }
    return {
        status: response.status,
        data: await response.json(),
    }
}

export const put = async (path, data, auth = false, tried = false) => {
    const response = await fetch(getApiUrl(path), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if(response.status === 401 && !tried) {
        await reauthenticate();
        return await put(path, data, auth, true);
    }
    return {
        status: response.status,
        data: await response.json(),
    };
}

export const patch = async (path, data, auth = false, tried = false) => {
    const response = await fetch(getApiUrl(path), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if(response.status === 401 && !tried) {
        await reauthenticate();
        return await patch(path, data, auth , true);
    }
    return {
        status: response.status,
        data: await response.json(),
    }
}

export const del = async (path, auth = false, tried = false) => {
    const response = await fetch(getApiUrl(path), {
        method: 'DELETE',
        headers: {
        },
        credentials: 'include',
    });
    if(response.status === 401 && !tried) {
        await reauthenticate();
        return await del(path, auth, true);
    }
    return {
        status: response.status,
    }
}