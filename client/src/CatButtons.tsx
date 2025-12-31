import {Link } from 'react-router-dom'

const CatButtons = () => {
    return (
      
        <div >

          <nav>
            <div className='buttons'>
              <button><Link to={"/post/categoryPython"}>Python</Link></button>
              <button><Link to={"/post/category/Javascript"}>JavaScript</Link></button>
              <button><Link to={"/post/category/react"}>React</Link></button>
              <button><Link to={"/post/category/Web Development"}>Web Development</Link></button>
              <button><Link to={"/post/category/UI/UX Design"}>UI/UX Design</Link></button>
            </div>
          </nav>
        </div>
    )
}

export default CatButtons;

