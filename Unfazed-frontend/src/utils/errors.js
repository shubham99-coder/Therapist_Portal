// Turns an axios error into a message a person can act on
export function getErrorMessage(err) {
  if (!err.response) return 'Cannot reach the server. Check that the backend is running.'
  const data = err.response.data
  if (data?.message) return data.message
  if (Array.isArray(data?.errors) && data.errors.length) {
    const first = data.errors[0]
    return first.path ? `${first.path}: ${first.msg}` : first.msg
  }
  return 'Something went wrong. Try again.'
}
