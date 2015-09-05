json.array!(@users) do |user|
  json.extract! user, :id, :username, :password, :phonenumber, :venmoid
  json.url user_url(user, format: :json)
end
