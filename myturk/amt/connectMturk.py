from boto.mturk.connection import MTurkConnection


AWSAccessKeyId=''
AWSSecretKey=''

print('You should not see this')


ACCESS_ID = AWSAccessKeyId
SECRET_KEY = AWSSecretKey

# adjust host setting, depending on whether HIT is live (production) or in testing mode (sandbox)
# mode = "sandbox"
# # mode ="production"

# if mode=="production":
#     HOST='mechanicalturk.amazonaws.com'
# else:
#     HOST='mechanicalturk.sandbox.amazonaws.com'

HOST = 'mechanicalturk.sandbox.amazonaws.com'

mtc = MTurkConnection(aws_access_key_id=ACCESS_ID,
                      aws_secret_access_key=SECRET_KEY,
                      host=HOST)

print mtc.get_account_balance()






