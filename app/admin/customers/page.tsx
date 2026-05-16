import React from 'react'

const pageTitleStyle: React.CSSProperties = {
   fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
   fontWeight: 400,
   fontStyle: 'normal',
   color: 'rgb(0,0,0)',
   fontSize: '48px',
   lineHeight: '60px',
};

function page() {
   return (
      <div className="mt-10 text-center">
         <h1 style={pageTitleStyle}>User Management</h1>
      </div>
   )
}

export default page
