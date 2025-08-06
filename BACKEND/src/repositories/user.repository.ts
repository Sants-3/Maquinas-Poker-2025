import { getDataSource } from "@/lib/data-source";
import { User } from "@/entity/User";

export async function findUserByNombreRepository(nombre: string) {
    const db = await getDataSource();
    const userRepository = db.getRepository(User);
    return userRepository.findOne( {where: { nombre }} );
}

export async function updateUltimoLoginRepository(id: number) {
    const db = await getDataSource();
    const userRepository = db.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
        return null;
    }
    user.ultimo_login = new Date();
    return userRepository.save(user);
}

export async function getAllUsersRepository() {
    const db = await getDataSource();
    const userRepository = db.getRepository(User);
    return userRepository.find();
}

export async function createUserRepository(userData: Partial<User>) {
    const db = await getDataSource();
    const userRepository = db.getRepository(User);
    const newUser = userRepository.create(userData);
    return userRepository.save(newUser)
}

export async function findUserByEmailRepository(email: string) {
    const db = await getDataSource();
    const userRepository = db.getRepository(User);
    return userRepository.findOne({ where: { email } });
}

export async function updateUserRepository(id: number, userData: Partial<User>) {
    const db = await getDataSource();
    const userRepository = db.getRepository(User);
    await userRepository.update(id, userData);
    return userRepository.findOne({ where: { id } });
}

export async function deleteUserRepository(id: number) {
    const db = await getDataSource();
    const userRepository = db.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
        return null;
    }
    await userRepository.remove(user);
    return user;
}