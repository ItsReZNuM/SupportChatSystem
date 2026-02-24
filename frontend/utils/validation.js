export default function validation({email , password}){
    let error = {}
    // check email
    if(!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)){
        error.email ='ایمیل نامعتبر!'
    }
    // check email

    // check password
    if(!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)){
        error.password = 'رمز عبور باید ترکیبی از حروف بزرگ و کوچک، عدد و کاراکتر خاص باشد.'
    }
    // check password
    return error

}