export const sendEmailMock = jest.fn();

export const resendMock = {
  emails: {
    send: sendEmailMock,
  },
};