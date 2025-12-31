import Layout from './Layout'
import Homepage from './components/Homepage'
import Loginpage from './components/Loginpage'
import Registerpage from './components/Registerpage'
import Createpost from './components/Createpost'
import Postpage from './components/Postpage'
import { UserContextProvider } from './UserContext'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Footer from './components/Footer'
import EditPost from './components/EditPost'
import PostsByCategory from './components/PostsByCategory'

function App() {

  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Homepage/>}/>
          <Route path="/login" element={<Loginpage/>}/>
          <Route path="/register" element={<Registerpage/>}/>
          <Route path="/create" element={<Createpost/>}/>
          <Route path="/post/:id" element={<Postpage/>}/>
          <Route path="/post/category/:category" element={<PostsByCategory/>}/>
          <Route path="/edit/:id" element={<EditPost/>}/>

        </Route>
      </Routes>
      <Footer/>
    </UserContextProvider>

  )
}

export default App
