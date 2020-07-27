const deleteProduct = (btn) =>{
    console.log('clicked');

    const productElement = btn.closest('article');
    const prodId = btn.parentNode.querySelector('[name=productId]').value;

   
    fetch('/admin/delete/'+prodId,{
        method: 'GET',
    }).then(result=>{
        console.log(result);
        productElement.parentNode.removeChild(productElement);  
    }).catch(
        err=>{  
            console.log(err);
        }
    );

};