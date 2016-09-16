Rails.application.routes.draw do
  get 'home/index'

  root to: "about#index"
  post 'display' => 'home#display'
	get 'linechart' => 'home#linechart'
  get 'chloropleth', to: "home#chloropleth"

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
