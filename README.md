# Libri

A simple web app to manage your books.

## Getting Started

### Development

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server

### Build Release

1. Run `npm run build` to build the application
2. Run `npm start` to start the production server

### Docker

Build and run the Docker image

```sh
docker build -t libri .
docker run -p 3000:3000 libri
```

## Goals

The goal of this project is to provide a simple intuitive interface for managing your books.

- [ ] Performance: The application should load quickly and respond quickly to user interactions.
- [ ] Design: The application should have a clean and intuitive design that is easy to navigate.
- [ ] User Experience: The application should provide a seamless user experience, with clear and concise instructions.

### Inspiration

This project was inspired by the following projects:

- [Calibre](https://calibre-ebook.com/): A powerful and feature-rich e-book management application.
- [Calibre-Web](https://github.com/janeczku/calibre-web): A web interface for Calibre.

While I love Calibre, it is too large and complex for my needs. I wanted a simple and lightweight
solution that could be easily deployed on a server and accessed from anywhere.

## Contributing

Contributions are welcome! If you have any suggestions or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
