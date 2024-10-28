from faker import Faker

fake = Faker()

TEST_USER_EMAIL = fake.email()
TEST_USER_PASSWORD = fake.password()
