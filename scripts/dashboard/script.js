import * as auth from '../utils/auth.js';
if (!auth.isLoggedIn()) {
    window.location.href = '/';
}

import './sidebar.js';
import './content.js';