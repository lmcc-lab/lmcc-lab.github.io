import requests
from scripts.bank import access_token, source_url
from pprint import pprint
from typing import Union, List
from datetime import datetime, timedelta


class UpData:

    def __init__(self, start_date, end_date):
        if start_date == "":
            start_date = str(datetime.today().date())
        if end_date == "":
            end_date = str(datetime.today().date()+timedelta(days=1))

        self.start_date = datetime.strptime(start_date, '%Y-%m-%d').isoformat()
        self.end_date = datetime.strptime(end_date, '%Y-%m-%d').isoformat()

        url = f"{source_url}/transactions"
        headers = {'Authorization': 'Bearer ' + access_token}
        params = {'filter[since]': str(self.start_date)+'+11:00',
                  'filter[until]': str(self.end_date)+'+11:00',
                  'page[size]': '100'}

        # Make the request
        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            # Print the JSON data
            self.data = response.json()
            self.date_range = (self.data['data'][-1]['attributes']['createdAt'], self.data['data'][0]['attributes']['createdAt'])
        else:
            raise ConnectionError(f"Something went wrong {response}")

    def get_transaction(self, contain_attribute: dict = None):

        # return the transaction data if contain_attribute is None
        if contain_attribute is None:
            return self.data['data']

        # return the focused transactions that are specificied by the contain_attribute dictionary with a specific value
        focused_transactions = []
        for transaction in self.data['data']:
            attributes = transaction['attributes']
            correct_match = 0
            for key in contain_attribute:
                if contain_attribute[key].casefold() in attributes[key].casefold():
                    correct_match += 1
                if correct_match == len(contain_attribute):
                    focused_transactions.append(transaction)
        return focused_transactions

    def get_transaction_by_name(self, name: str):
        return self.get_transaction(contain_attribute={"description": name})

    def show_all_transaction_descriptions(self,
                                          dont_include=
                                          ("Round Up",
                                           "Omtd",
                                           "Marian Tillett",
                                           "CommBank Transactional",
                                           "Transfer from",
                                           "CTRLINK",
                                           "Family Support",
                                           "Final interest payment"),
                                          payments_only=False):
        all_descriptions = set()
        dont_include = tuple([val.casefold() for val in dont_include])
        for transaction in self.data['data']:
            attributes = transaction['attributes']
            description = attributes['description']
            if description.casefold() not in dont_include and not any([substr in description.casefold() for substr in dont_include]):
                if payments_only and float(attributes['amount']['value']) > 0:
                    all_descriptions.add(description)
                elif not payments_only:
                    all_descriptions.add(description)
        return all_descriptions

    def get_payment_only(self, name: str = None):
        transactions = self.get_transaction(contain_attribute={"description": name} if name is not None else None)
        focused_transaction = []
        if name == '':
            return []
        for transaction in transactions:
            value = float(transaction['attributes']['amount']['value'])
            if value > 0:
                focused_transaction.append(transaction)
        return focused_transaction

    @staticmethod
    def simplify_transaction(transactions,
                            attributes_to_display: Union[tuple, list] =
                            ('description', 'createdAt', {'amount': 'value'}),
                            display_names=('Name', 'Date', 'Amount')):
        data = []
        for transaction in transactions:
            simp_trans = {}
            attributes = transaction['attributes']
            for dis_name, atd in zip(display_names, attributes_to_display):
                if type(atd) == str:
                    if dis_name.casefold() == 'date':
                        value = datetime.fromisoformat(attributes[atd])
                        value = value.strftime('%d %b %Y %H:%M')
                    else:
                        value = attributes[atd]
                    simp_trans[dis_name] = value
                elif type(atd) == dict:
                    for key in atd:
                        simp_trans[dis_name] = (attributes[key][atd[key]])
            data.append(simp_trans)
        return data

    @staticmethod
    def make_pretty(simple_trans_data: List[dict]):
        result = []
        for trans in simple_trans_data:
            trans_str = ', '.join([key + ': ' + trans[key] for key in trans])
            result.append(trans_str)
        return result



