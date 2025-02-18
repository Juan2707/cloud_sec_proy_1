const BASE_URL = "http://127.0.0.1:8000";

export const register =  async (email, username, password) => {
    try{
        const response = await fetch(`${BASE_URL}/user`,{
            method: 'POST',
            body: JSON.stringify({email:email, username:username, password:password}),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error desconocido en el registro' };
        }
        return { error: false, data };
    }   
    catch(error){
        console.error('Error en el registro ', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
};

export const login = async (email, password) => {
    try{
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);
        const response = await fetch(`${BASE_URL}/token`,{
            method: 'POST',
            //aqui el body es x-www-form-urlencoded con Key username y Key password con los valores necesarios para el login
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        const data = await response.json();
        if(!response.ok){
            return { error: true, message: data.detail || 'Error en el login' };
        }
        localStorage.setItem('token', data.token);
        return { error: false, data };
    } catch(error){
        console.error('Error en el login', error);
        return { error: true, message: 'Error de conexión o problema en el servidor' };
    }
}