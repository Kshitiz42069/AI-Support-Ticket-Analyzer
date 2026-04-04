from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashPassword(password:str):
    return pwd_context.hash(password[:72])

def verifyPassword(plainPassword, hashPassword):
    return pwd_context.verify(plainPassword[:72],hashPassword)