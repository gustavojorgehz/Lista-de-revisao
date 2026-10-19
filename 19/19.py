
import json
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode


def pesquisar_livros():
    titulo = input("Digite o título do livro: ").strip()

    if not titulo:
        print("Erro: informe um título para pesquisar.")
        return

    parametros = urlencode({
        "title": titulo,
        "fields": "title,author_name,first_publish_year",
        "limit": 5
    })

    url = "https://openlibrary.org/search.json?" + parametros

    try:
        requisicao = Request(
            url,
            headers={"User-Agent": "ConsultaLivrosPython/1.0"}
        )

        with urlopen(requisicao, timeout=10) as resposta:
            codigo_http = resposta.status
            print("\nCódigo HTTP:", codigo_http)

            if codigo_http == 200:
                dados = json.loads(
                    resposta.read().decode("utf-8")
                )

                livros = dados.get("docs", [])

                if not livros:
                    print("Nenhum livro encontrado.")
                    return

                print("\n===== LIVROS ENCONTRADOS =====")

                for numero, livro in enumerate(livros, start=1):
                    autores = livro.get(
                        "author_name", ["Autor não informado"]
                    )
                    ano = livro.get(
                        "first_publish_year", "Não informado"
                    )

                    print(f"\nLivro {numero}")
                    print("Título:", livro.get("title", "Não informado"))
                    print("Autor(es):", ", ".join(autores))
                    print("Primeiro ano de publicação:", ano)

            else:
                print("A requisição não foi bem-sucedida.")

    except HTTPError as erro:
        print("Erro HTTP:", erro.code)

    except URLError:
        print("Erro de conexão. Verifique sua internet.")

    except (ValueError, TimeoutError):
        print("Erro ao interpretar a resposta ou tempo limite excedido.")


def main():
    while True:
        pesquisar_livros()

        continuar = input(
            "\nDeseja pesquisar outro livro? (sim/nao): "
        ).strip().lower()

        if continuar != "sim":
            print("Programa encerrado.")
            break


    main()
