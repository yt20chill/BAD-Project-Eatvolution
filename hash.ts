import * as bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * @params plainPassword: supplied when signup
 */
export async function hashPassword(plainPassword: string) {
    const hash: string = await bcrypt.hash(plainPassword, SALT_ROUNDS)
    return hash
}

/**
 * @params options.plainPassword: supplied when login
 * @params options.hashedPassword: looked up from database
 */
export async function checkPassword(plainPassword: string, hashedPassword: string
) {
    const isMatched: boolean = await bcrypt.compare(
        plainPassword,
        hashedPassword,
    )
    return isMatched
}

// hashPassword('abchfhgd').then(console.log)
// checkPassword('abchfhgd', '$2a$10$/N8y5vNHWQLVsqyZHnFIeO4oTYszAXglnCcANI5C21tvg5Kfh0CVi').then(console.log) 