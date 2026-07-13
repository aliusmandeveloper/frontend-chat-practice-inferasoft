export const getUsers = async () => {

    const response = await fetch(
        "http://localhost:5001/api/users"
    );

    const users = await response.json();

    return users;
};