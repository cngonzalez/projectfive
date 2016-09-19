Rails.application.routes.draw do
  get 'home/index'

  root to: "about#index"
  post 'display' => 'home#display'
	get 'linechart' => 'home#linechart'
	post 'linechart' => 'home#drawLineChart'
	post 'uploadfile' => 'home#uploadCSVFile'
  get 'splash', to: "home#splash"
  get 'start', to: 'home#start'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
