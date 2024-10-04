import streamlit as st

# Placeholder for storing user credentials (In a real app, you'd use a database)
if 'users' not in st.session_state:
    st.session_state.users = {'admin': '1234'}

st.title('Amazing User Login and Signup App')

# Initialize session state for user data
if 'user_state' not in st.session_state:
    st.session_state.user_state = {
        'username': '',
        'password': '',
        'logged_in': False
    }

# Toggle between login and signup
choice = st.radio("Choose an option", ('Login', 'Signup'))

if choice == 'Login':
    if not st.session_state.user_state['logged_in']:
        st.write('Please login')
        username = st.text_input('Username')
        password = st.text_input('Password', type='password')
        submit = st.button('Login')

        if submit and not st.session_state.user_state['logged_in']:
            if username in st.session_state.users and st.session_state.users[username] == password:
                st.session_state.user_state['username'] = username
                st.session_state.user_state['password'] = password
                st.session_state.user_state['logged_in'] = True
                st.write('You are logged in')
                st.rerun()
            else:
                st.write('Invalid username or password')
    elif st.session_state.user_state['logged_in']:
        st.write('Welcome to the app')
        st.write('You are logged in as:', st.session_state.user_state['username'])
        if st.button('Logout'):
            st.session_state.user_state['logged_in'] = False
            st.rerun()

elif choice == 'Signup':
    st.write('Create a new account')
    new_username = st.text_input('New Username')
    new_password = st.text_input('New Password', type='password')
    signup_submit = st.button('Signup')

    if signup_submit:
        if new_username in st.session_state.users:
            st.write('Username already exists. Please choose a different one.')
        else:
            st.session_state.users[new_username] = new_password
            st.write('Signup successful! You can now log in.')
